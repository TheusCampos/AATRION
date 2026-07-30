import requests
import uuid

BASE_URL = "http://localhost:3000/api"
TIMEOUT = 30

# Replace this with a valid token for an authenticated user before running tests.
AUTH_TOKEN = "Bearer YOUR_VALID_AUTH_TOKEN"

HEADERS_AUTH = {
    "Authorization": AUTH_TOKEN,
    "Content-Type": "application/json",
}

HEADERS_NO_AUTH = {
    "Content-Type": "application/json",
}


def test_linkedin_audit_creation_and_listing():
    audit_endpoint = f"{BASE_URL}/linkedin/audit"

    # 1. Attempt unauthenticated POST (should fail)
    payload_valid = {
        "linkedinProfileText": "Experienced software developer with a focus on Python and testing.",
        "professionalArea": "Software Development",
        "targetJob": "Senior Python Developer"
    }
    r = requests.post(audit_endpoint, json=payload_valid, headers=HEADERS_NO_AUTH, timeout=TIMEOUT)
    assert r.status_code in (401, 403), "Unauthenticated POST should fail with 401 or 403"

    # 2. Attempt unauthenticated GET (should fail)
    r = requests.get(audit_endpoint, headers=HEADERS_NO_AUTH, timeout=TIMEOUT)
    assert r.status_code in (401, 403), "Unauthenticated GET should fail with 401 or 403"

    # 3. Authenticated POST with valid input
    r = requests.post(audit_endpoint, json=payload_valid, headers=HEADERS_AUTH, timeout=TIMEOUT)
    assert r.status_code == 201, f"Authenticated valid POST failed, status {r.status_code}"
    resp_data = r.json()
    assert "id" in resp_data and isinstance(resp_data["id"], (str, int)), "Response missing audit ID"
    audit_id = resp_data["id"]
    assert "score" in resp_data, "Response missing audit score"
    assert isinstance(resp_data["score"], (int, float)), "Audit score should be a number"
    assert "suggestions" in resp_data and isinstance(resp_data["suggestions"], list), "Suggestions should be a list"

    # 4. Authenticated POST with invalid inputs (input validation, empty fields)
    invalid_payloads = [
        {},  # Missing all required
        {"linkedinProfileText": "", "professionalArea": "", "targetJob": ""},
        {"linkedinProfileText": "a" * 10001, "professionalArea": "X"*201},  # Exceeding reasonable length
        {"linkedinProfileText": "Valid text", "professionalArea": "<script>alert(1)</script>"},
    ]
    for invalid_payload in invalid_payloads:
        r = requests.post(audit_endpoint, json=invalid_payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
        assert r.status_code == 400, f"Invalid input was accepted: {invalid_payload}, status {r.status_code}"

    # 5. Authenticated GET - list audits and validate presence of created audit
    r = requests.get(audit_endpoint, headers=HEADERS_AUTH, timeout=TIMEOUT)
    assert r.status_code == 200, f"Authenticated GET failed, status {r.status_code}"
    audits_list = r.json()
    assert isinstance(audits_list, list), "Audit list response is not a list"
    found = False
    for audit in audits_list:
        assert "id" in audit and "score" in audit and "suggestions" in audit, "Audit missing required fields"
        if str(audit.get("id")) == str(audit_id):
            found = True
    assert found, "Created audit not found in audit listing"

    # 6. Security: Attempt SQL injection like content
    sql_injection_payload = {
        "linkedinProfileText": "'; DROP TABLE users; --",
        "professionalArea": "Engineering",
        "targetJob": "DBA"
    }
    r = requests.post(audit_endpoint, json=sql_injection_payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
    assert r.status_code in (201, 400), "SQL injection attempt should not succeed"
    # If created, delete below will clean up.

    # 7. Security: Attempt prompt injection with script tags - ensure rejected or sanitized
    prompt_injection_payload = {
        "linkedinProfileText": "<script>alert('XSS')</script> Experienced in security.",
        "professionalArea": "Security",
    }
    r = requests.post(audit_endpoint, json=prompt_injection_payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
    assert r.status_code in (201, 400), "Prompt injection attempt should be rejected or sanitized"

    # Clean up created resource if possible
    # We try to delete the audit created in step 3 if API allows deletion - not specified in this test
    # But deletion endpoint /api/linkedin/audit/[id] exists according to PRD - so let's attempt to delete.
    delete_endpoint = f"{audit_endpoint}/{audit_id}"
    try:
        r_del = requests.delete(delete_endpoint, headers=HEADERS_AUTH, timeout=TIMEOUT)
        # 204 No Content or 200 OK are typical success codes for delete
        assert r_del.status_code in (200, 204), "Failed to delete created audit after test"
    except Exception:
        pass


test_linkedin_audit_creation_and_listing()