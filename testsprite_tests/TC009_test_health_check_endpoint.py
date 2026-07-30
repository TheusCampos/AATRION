import requests

def test_health_check_endpoint():
    base_url = "http://localhost:3000/api"
    url = f"{base_url}/health"
    timeout = 30

    # Test valid request (no authentication required)
    try:
        response = requests.get(url, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected HTTP 200 OK, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Basic checks for health response fields that indicate service status/readiness
    assert isinstance(data, dict), "Response JSON must be an object"
    # Common expected keys in health check: 'status', 'uptime', 'ready' (may vary)
    # Since PRD does not specify schema, check probable keys safely
    expected_keys = {"status", "ready"}
    assert any(key in data for key in expected_keys), f"Response JSON does not contain any expected health keys: {expected_keys}"
    if "status" in data:
        assert data["status"] in ["ok", "healthy", "pass", "up", True], f"Unexpected status value: {data['status']}"
    if "ready" in data:
        assert isinstance(data["ready"], bool), f"'ready' field should be boolean but got {type(data['ready'])}"

    # Security and robustness tests

    # 1. Authentication bypass: re-check that no auth header is needed (already done by request without auth)
    # 2. Authorization checks: health endpoint should not require auth - test with fake auth header as negative test
    headers = {"Authorization": "Bearer invalidtoken"}
    try:
        resp_auth = requests.get(url, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request with auth header to {url} failed: {e}"

    # Should respond similarly with or without auth header, no auth needed
    assert resp_auth.status_code == 200, f"Status code with fake auth {resp_auth.status_code}, expected 200"
    assert resp_auth.json() == data, "Responses with and without auth header should match"

    # 3. Input validation and injection attempts: health endpoint is GET without params, test query injection attempt
    injection_strings = [
        "' OR '1'='1",
        "<script>alert('xss')</script>",
        "'; DROP TABLE users; --",
        "normalinput",
        "a" * 1000  # very long input
    ]
    for inj in injection_strings:
        inj_url = f"{url}?testparam={inj}"
        try:
            resp_inj = requests.get(inj_url, timeout=timeout)
        except requests.RequestException as e:
            assert False, f"Request with injection param failed: {e}"
        # Expect 200 or at least no server errors
        assert resp_inj.status_code in (200, 400, 422), f"Injection param caused unexpected status {resp_inj.status_code}"
        # Server should not reveal details in error messages
        if resp_inj.status_code >= 400:
            content = resp_inj.text.lower()
            assert "sql" not in content and "exception" not in content and "error" in content or "bad" in content or "invalid" in content, "Potential error detail leak"

    # 4. Rate limiting check: rapid multiple requests should not cause server to fail or expose info
    for _ in range(10):
        try:
            r = requests.get(url, timeout=timeout)
            assert r.status_code == 200, f"Rate limiting test: unexpected status {r.status_code}"
        except requests.RequestException as e:
            assert False, f"Rate limiting test failed: {e}"

    # 5. CORS & CSRF: cannot be fully tested via backend API; headers could be checked if present
    # We'll check for typical CORS headers presence (may be absent if not configured)
    cors_headers = ["Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"]
    for header in cors_headers:
        # Header might be missing if CORS is not configured; not a failure
        _ = response.headers.get(header)

    # CSRF typically applies to state-changing requests. Since health is GET, no CSRF tokens expected.

test_health_check_endpoint()