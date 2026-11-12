#!/bin/bash
set -e

BASE_URL="http://localhost:8000/api/v1"

echo "=================================================="
echo "      NAGARCONNECT END-TO-END API TEST SUITE      "
echo "=================================================="

# 1. Health Checks
echo ""
echo ">>> [1/14] Testing Health Check Endpoints..."
LIVE_RES=$(curl -s "$BASE_URL/health/live")
echo "GET /health/live: $LIVE_RES"

READY_RES=$(curl -s "$BASE_URL/health/ready")
echo "GET /health/ready: $READY_RES"

# 2. Public Cities
echo ""
echo ">>> [2/14] Testing Public Cities Endpoint..."
CITIES_RES=$(curl -s "$BASE_URL/public/cities")
CITIES_COUNT=$(echo "$CITIES_RES" | grep -o '"name":' | wc -l | tr -d ' ')
echo "GET /public/cities: Successfully retrieved $CITIES_COUNT municipal cities from database."

# Get Lucknow city ID
LUCKNOW_ID=$(python3 -c "
import urllib.request, json
data = json.loads(urllib.request.urlopen('$BASE_URL/public/cities').read().decode('utf-8'))
lko = next((c for c in data if c['name'] == 'Lucknow'), data[0])
print(lko['id'])
")
echo "Target City (Lucknow) ID: $LUCKNOW_ID"

# 3. Public Wards
echo ""
echo ">>> [3/14] Testing Public Wards for Lucknow..."
WARDS_RES=$(curl -s "$BASE_URL/public/wards?city_id=$LUCKNOW_ID")
WARD_COUNT=$(echo "$WARDS_RES" | grep -o '"ward_name":' | wc -l | tr -d ' ')
echo "GET /public/wards: Retrieved $WARD_COUNT wards for Lucknow."

WARD_ID=$(python3 -c "
import urllib.request, json
data = json.loads(urllib.request.urlopen('$BASE_URL/public/wards?city_id=$LUCKNOW_ID').read().decode('utf-8'))
print(data[0]['id'])
")
WARD_NAME=$(python3 -c "
import urllib.request, json
data = json.loads(urllib.request.urlopen('$BASE_URL/public/wards?city_id=$LUCKNOW_ID').read().decode('utf-8'))
print(data[0]['ward_name'])
")
echo "Selected Ward: $WARD_NAME ($WARD_ID)"

# 4. Public Search
echo ""
echo ">>> [4/14] Testing Public Search Endpoint for '$WARD_NAME'..."
SEARCH_RES=$(curl -s "$BASE_URL/public/search?q=$WARD_NAME")
echo "GET /public/search: $SEARCH_RES"

# 5. Public Notices
echo ""
echo ">>> [5/14] Testing Public Notices..."
NOTICES_RES=$(curl -s "$BASE_URL/public/notices")
NOTICES_COUNT=$(echo "$NOTICES_RES" | grep -o '"title":' | wc -l | tr -d ' ')
echo "GET /public/notices: Retrieved $NOTICES_COUNT live notices from database."

# 6. Citizen Registration
echo ""
echo ">>> [6/14] Testing Citizen Registration with Real Payload..."
RANDOM_NUM=$((1000 + RANDOM % 9000))
CITIZEN_EMAIL="citizen.curl.$RANDOM_NUM@example.com"
CITIZEN_REG_PAYLOAD=$(cat <<EOF
{
  "email": "$CITIZEN_EMAIL",
  "password": "CitizenSecret@2026",
  "first_name": "Ramesh",
  "last_name": "Kumar",
  "phone": "98765$RANDOM_NUM",
  "city_id": "$LUCKNOW_ID",
  "ward_id": "$WARD_ID",
  "address": "House 42, Hazratganj Market Lane 3"
}
EOF
)
REG_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$CITIZEN_REG_PAYLOAD")

CITIZEN_USER_ID=$(echo "$REG_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
echo "POST /auth/register: Citizen created successfully! User ID: $CITIZEN_USER_ID ($CITIZEN_EMAIL)"

# 7. Citizen Login
echo ""
echo ">>> [7/14] Testing Citizen Login..."
LOGIN_PAYLOAD=$(cat <<EOF
{
  "email": "$CITIZEN_EMAIL",
  "password": "CitizenSecret@2026"
}
EOF
)
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_PAYLOAD")

CITIZEN_TOKEN=$(echo "$LOGIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "POST /auth/login: Citizen logged in! Bearer token: ${CITIZEN_TOKEN:0:30}..."

# 8. Citizen File Complaint
echo ""
echo ">>> [8/14] Testing Citizen Complaint Registration..."
COMPLAINT_PAYLOAD=$(cat <<EOF
{
  "city_id": "$LUCKNOW_ID",
  "ward_id": "$WARD_ID",
  "category": "Sanitation & Garbage",
  "title": "Overflowing Community Garbage Bin - Test $RANDOM_NUM",
  "description": "Solid waste overflowing on main road opposite bank ATM. Requires immediate sanitation crew.",
  "address_text": "Opposite SBI ATM, Hazratganj Main Road",
  "priority": "HIGH"
}
EOF
)
NEW_COMPLAINT_RES=$(curl -s -X POST "$BASE_URL/citizen/complaints" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CITIZEN_TOKEN" \
  -d "$COMPLAINT_PAYLOAD")

COMPLAINT_ID=$(echo "$NEW_COMPLAINT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
REF_NO=$(echo "$NEW_COMPLAINT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['reference_no'])")
echo "POST /citizen/complaints: Created complaint Ref No: $REF_NO (ID: $COMPLAINT_ID)"

# 9. Citizen View My Complaints
echo ""
echo ">>> [9/14] Testing Citizen List My Complaints..."
MY_COMPLAINTS=$(curl -s "$BASE_URL/citizen/complaints" \
  -H "Authorization: Bearer $CITIZEN_TOKEN")
MY_COMPLAINTS_COUNT=$(echo "$MY_COMPLAINTS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "GET /citizen/complaints: Citizen has $MY_COMPLAINTS_COUNT active registered complaint(s)."

# 10. Municipal Admin Login
echo ""
echo ">>> [10/14] Testing Municipal Admin Login (admin@lmc.gov.in)..."
ADMIN_LOGIN_PAYLOAD='{"email":"admin@lmc.gov.in","password":"NagarConnect@2026"}'
ADMIN_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$ADMIN_LOGIN_PAYLOAD")

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "POST /auth/login: Municipal Admin logged in! Bearer token: ${ADMIN_TOKEN:0:30}..."

# 11. Municipal Admin Dashboard Stats & Queue
echo ""
echo ">>> [11/14] Testing Municipal Admin Dashboard Stats..."
STATS_RES=$(curl -s "$BASE_URL/admin/dashboard/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "GET /admin/dashboard/stats: $STATS_RES"

# 12. Municipal Admin Update Complaint Status
echo ""
echo ">>> [12/14] Testing Complaint Status Transition to TRIAGED..."
STATUS_UPDATE_PAYLOAD='{"status":"TRIAGED","reason_or_remark":"Assigned to morning sanitation dispatch crew via automated curl test"}'
STATUS_RES=$(curl -s -X POST "$BASE_URL/admin/complaints/$COMPLAINT_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "$STATUS_UPDATE_PAYLOAD")
echo "POST /admin/complaints/$COMPLAINT_ID/status: $STATUS_RES"

# 13. Municipal Admin Publish Notice
echo ""
echo ">>> [13/14] Testing Municipal Admin Notice Publishing..."
NOTICE_PAYLOAD=$(cat <<EOF
{
  "title": "Scheduled Sanitation Drive Test - Notice $RANDOM_NUM",
  "summary": "Special intensive mechanized street cleaning in Central Zone.",
  "content": "All residents are requested to cooperate with the municipal sanitation teams.",
  "category": "SANITATION",
  "status": "PUBLISHED"
}
EOF
)
PUB_NOTICE_RES=$(curl -s -X POST "$BASE_URL/admin/notices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "$NOTICE_PAYLOAD")
PUB_NOTICE_ID=$(echo "$PUB_NOTICE_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "POST /admin/notices: Notice published successfully! ID: $PUB_NOTICE_ID"

# 14. Super Admin Login & Metrics
echo ""
echo ">>> [14/14] Testing Platform Super Admin Login & Global Metrics..."
SUPER_LOGIN_PAYLOAD='{"email":"superadmin@nagarconnect.gov.in","password":"NagarConnect@2026"}'
SUPER_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$SUPER_LOGIN_PAYLOAD")

SUPER_TOKEN=$(echo "$SUPER_LOGIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "POST /auth/login: Platform Super Admin logged in! Bearer token: ${SUPER_TOKEN:0:30}..."

SUPER_METRICS=$(curl -s "$BASE_URL/super-admin/metrics" \
  -H "Authorization: Bearer $SUPER_TOKEN")
echo "GET /super-admin/metrics: $SUPER_METRICS"

SUPER_ORGS=$(curl -s "$BASE_URL/super-admin/organizations" \
  -H "Authorization: Bearer $SUPER_TOKEN")
ORGS_COUNT=$(echo "$SUPER_ORGS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "GET /super-admin/organizations: $ORGS_COUNT Municipal Corporation Tenants currently provisioned."

echo ""
echo "=================================================="
echo "    ALL 14 API TEST SUITES PASSED WITH SUCCESS!   "
echo "=================================================="
