import pytest


@pytest.mark.asyncio
async def test_health_endpoints(client):
    res_live = await client.get("/api/v1/health/live")
    assert res_live.status_code == 200
    assert res_live.json()["status"] == "ok"

    res_ready = await client.get("/api/v1/health/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"


@pytest.mark.asyncio
async def test_public_discovery_endpoints(client):
    # Cities
    res_cities = await client.get("/api/v1/public/cities")
    assert res_cities.status_code == 200
    cities = res_cities.json()
    assert len(cities) >= 4
    assert any(c["name"] == "Lucknow" for c in cities)

    # City Details
    lucknow = next(c for c in cities if c["name"] == "Lucknow")
    res_city = await client.get(f"/api/v1/public/cities/{lucknow['id']}")
    assert res_city.status_code == 200
    assert "contacts" in res_city.json()

    # Wards
    res_wards = await client.get(f"/api/v1/public/wards?city_id={lucknow['id']}")
    assert res_wards.status_code == 200
    assert len(res_wards.json()) >= 4

    # Public Notices
    res_notices = await client.get("/api/v1/public/notices")
    assert res_notices.status_code == 200
    assert len(res_notices.json()) >= 3

    # Public Services
    res_services = await client.get("/api/v1/public/services")
    assert res_services.status_code == 200
    assert len(res_services.json()) >= 3


@pytest.mark.asyncio
async def test_auth_and_citizen_workflow(client):
    # 1. Citizen login with seeded account
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "citizen@example.com", "password": "Citizen@2026"},
    )
    assert login_res.status_code == 200
    data = login_res.json()
    token = data["access_token"]
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check current identity (/auth/me)
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "citizen@example.com"
    assert me_res.json()["user_type"] == "CITIZEN"

    # 3. List citizen complaints
    cmp_res = await client.get("/api/v1/citizen/complaints", headers=headers)
    assert cmp_res.status_code == 200
    complaints = cmp_res.json()
    assert len(complaints) >= 1

    # 4. Submit new complaint for Lucknow
    cities = (await client.get("/api/v1/public/cities")).json()
    lucknow = next(c for c in cities if c["name"] == "Lucknow")
    wards = (await client.get(f"/api/v1/public/wards?city_id={lucknow['id']}")).json()
    assert len(wards) > 0

    new_cmp_res = await client.post(
        "/api/v1/citizen/complaints",
        headers=headers,
        json={
            "city_id": lucknow["id"],
            "ward_id": wards[0]["id"],
            "category": "Roads & Potholes",
            "title": "Severe pothole causing bike skids near main crossing",
            "description": "Deep depression in the road surface after rain, requires immediate asphalt patching.",
            "address_text": "Near Traffic Post, Hazratganj Main Road",
            "priority": "HIGH",
        },
    )
    assert new_cmp_res.status_code == 201
    created = new_cmp_res.json()
    assert created["status"] == "SUBMITTED"
    assert created["reference_no"].startswith("CMP-")

    # 5. Track created complaint
    track_res = await client.get(f"/api/v1/citizen/complaints/{created['id']}", headers=headers)
    assert track_res.status_code == 200
    assert track_res.json()["id"] == created["id"]


@pytest.mark.asyncio
async def test_tenant_and_citizen_isolation(client):
    # Citizen 1 Login
    c1_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "citizen@example.com", "password": "Citizen@2026"},
    )
    c1_token = c1_login.json()["access_token"]
    c1_headers = {"Authorization": f"Bearer {c1_token}"}

    # Citizen 2 Login
    c2_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "citizen.varanasi@example.com", "password": "Citizen@2026"},
    )
    c2_token = c2_login.json()["access_token"]
    c2_headers = {"Authorization": f"Bearer {c2_token}"}

    # Citizen 1 gets their complaints
    c1_complaints = (await client.get("/api/v1/citizen/complaints", headers=c1_headers)).json()
    c1_complaint_id = c1_complaints[0]["id"]

    # Citizen 2 attempts to access Citizen 1's complaint directly by UUID -> MUST BE 403 Forbidden
    cross_access_res = await client.get(f"/api/v1/citizen/complaints/{c1_complaint_id}", headers=c2_headers)
    assert cross_access_res.status_code == 403


@pytest.mark.asyncio
async def test_admin_complaint_state_machine(client):
    # Municipal Admin Login
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@lmc.gov.in", "password": "NagarConnect@2026"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Get admin queue
    queue_res = await client.get("/api/v1/admin/complaints", headers=headers)
    assert queue_res.status_code == 200
    complaints = queue_res.json()
    assert len(complaints) > 0

    # Test stats
    stats_res = await client.get("/api/v1/admin/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    assert "total_complaints" in stats_res.json()
    assert "sla_compliance_rate" in stats_res.json()

    # Find a submitted complaint or transition
    target = complaints[0]
    # Invalid transition test: SUBMITTED to CLOSED directly should fail with 422
    if target["status"] == "SUBMITTED":
        invalid_res = await client.post(
            f"/api/v1/admin/complaints/{target['id']}/status",
            headers=headers,
            json={"status": "CLOSED", "reason_or_remark": "Premature closure"},
        )
        assert invalid_res.status_code == 422
