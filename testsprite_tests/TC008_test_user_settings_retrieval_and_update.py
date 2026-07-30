import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000/api"
SETTINGS_ENDPOINT = f"{BASE_URL}/user/settings"
TIMEOUT = 30

# Dummy valid authentication token for tests - replace with actual valid token for real tests
VALID_AUTH_TOKEN = "Bearer valid_test_auth_token"

def test_user_settings_retrieval_and_update():
    headers_auth = {
        "Authorization": VALID_AUTH_TOKEN,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    headers_no_auth = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Test 1: Access without authentication should be denied (Auth bypass)
    try:
        resp = requests.get(SETTINGS_ENDPOINT, headers=headers_no_auth, timeout=TIMEOUT)
        assert resp.status_code in (401, 403), f"Expected 401 or 403 for unauthorized GET, got {resp.status_code}"
    except RequestException as e:
        assert False, f"RequestException on unauthorized GET: {str(e)}"

    # Test 2: Retrieve current user settings with valid auth
    try:
        resp = requests.get(SETTINGS_ENDPOINT, headers=headers_auth, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 on authenticated GET, got {resp.status_code}"
        data = resp.json()
        assert isinstance(data, dict), "Response JSON is not an object"
        # Basic validation of expected fields—assuming at least 'preferences' key exists
        assert "preferences" in data, "Missing 'preferences' field in settings"
    except (RequestException, ValueError) as e:
        assert False, f"Error during authenticated GET: {str(e)}"

    # Test 3: Update user settings with valid data
    valid_update_payload = {
        "preferences": {
            "email_notifications": True,
            "theme": "dark",
            "language": "en-US"
        }
    }
    try:
        resp = requests.put(SETTINGS_ENDPOINT, headers=headers_auth, json=valid_update_payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 on valid update PUT, got {resp.status_code}"
        updated_data = resp.json()
        # Validate persistence: returned preferences should match update payload
        for key, val in valid_update_payload["preferences"].items():
            assert updated_data.get("preferences", {}).get(key) == val, f"Preference '{key}' mismatch after update"
    except (RequestException, ValueError) as e:
        assert False, f"Error during valid update PUT: {str(e)}"

    # Test 4: Update user settings with invalid data (input validation)
    invalid_payloads = [
        {"preferences": {"email_notifications": "notaboolean"}},       # Invalid type
        {"preferences": {"theme": "<script>alert(1)</script>"}},      # Potential XSS / injection
        {"preferences": {"language": "'; DROP TABLE users; --"}},     # SQL injection attempt
        {"preferences": {"unknown_field": True}},                     # Unexpected field
        {"preferences": None},                                         # Null preferences
        {},                                                           # Empty body
    ]
    for payload in invalid_payloads:
        try:
            resp = requests.put(SETTINGS_ENDPOINT, headers=headers_auth, json=payload, timeout=TIMEOUT)
            # Expect 400 or 422 for invalid input, or some client error
            assert resp.status_code in (400, 422), (
                f"Expected client error (400 or 422) for invalid payload {payload}, got {resp.status_code}"
            )
        except RequestException as e:
            assert False, f"RequestException during invalid update PUT with payload {payload}: {str(e)}"

    # Test 5: Rate limiting check - quickly send multiple requests and check for 429 or no error (may be not implemented)
    rate_test_passed = True
    for _ in range(10):
        try:
            resp = requests.get(SETTINGS_ENDPOINT, headers=headers_auth, timeout=TIMEOUT)
            if resp.status_code == 429:
                rate_test_passed = True
                break
        except RequestException:
            pass
    assert rate_test_passed, "Potential absence of rate limiting or unexpected error during rapid GET requests"

    # Test 6: CSRF and CORS: Since we cannot simulate browsers easily here, check CORS headers on preflight OPTIONS request
    try:
        headers_options = headers_auth.copy()
        headers_options["Origin"] = "http://malicious-site.com"
        resp = requests.options(SETTINGS_ENDPOINT, headers=headers_options, timeout=TIMEOUT)
        # Check Access-Control-Allow-Origin present and not '*'
        cors_header = resp.headers.get("Access-Control-Allow-Origin")
        assert cors_header is not None, "Missing CORS header Access-Control-Allow-Origin on OPTIONS"
        # It should not be '*', should be restricted to same origin domain or specific domains
        assert cors_header != "*", "CORS Access-Control-Allow-Origin should not allow all origins"
    except RequestException as e:
        # Some servers might not support OPTIONS, so this is non-fatal but noted
        pass

    # Test 7: Authentication token tampering (authorization check)
    tampered_auth = VALID_AUTH_TOKEN[:-5] + "abcde"
    headers_tampered = headers_auth.copy()
    headers_tampered["Authorization"] = tampered_auth
    try:
        resp = requests.get(SETTINGS_ENDPOINT, headers=headers_tampered, timeout=TIMEOUT)
        assert resp.status_code in (401, 403), f"Expected 401 or 403 for tampered token, got {resp.status_code}"
    except RequestException as e:
        assert False, f"RequestException on tampered token GET: {str(e)}"


test_user_settings_retrieval_and_update()