import pytest
from app.core.sse import broadcaster


@pytest.mark.asyncio
async def test_notifications_and_sse_workflow(client):
    # 1. Citizen Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "citizen@example.com", "password": "Citizen@2026"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {token}"}

    # 2. Retrieve citizen notifications list
    notifs_res = await client.get("/api/v1/notifications", headers=citizen_headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert isinstance(notifs, list)

    # 3. Mark single notification as read if any exists
    if len(notifs) > 0:
        target_id = notifs[0]["id"]
        read_res = await client.patch(
            f"/api/v1/notifications/{target_id}/read",
            headers=citizen_headers,
        )
        assert read_res.status_code == 200
        assert read_res.json()["success"] is True

    # 4. Mark all notifications as read
    read_all_res = await client.post("/api/v1/notifications/read-all", headers=citizen_headers)
    assert read_all_res.status_code == 200
    assert read_all_res.json()["success"] is True

    # 5. Verify SSE queue subscription and in-memory broadcaster
    queue = await broadcaster.subscribe("test-user-123")
    assert queue is not None
    await broadcaster.broadcast_to_user("test-user-123", "STATUS_CHANGE", {"status": "IN_PROGRESS"})
    event = await queue.get()
    assert event["event"] == "STATUS_CHANGE"
    assert event["data"]["status"] == "IN_PROGRESS"
    broadcaster.unsubscribe("test-user-123", queue)
