import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:3000/api"
JOBS_ENDPOINT = f"{BASE_URL}/jobs"
TIMEOUT = 30

# NOTE: Replace this token with a valid authentication token for the test environment.
AUTH_TOKEN = "Bearer VALID_AUTH_TOKEN_PLACEHOLDER"


def test_job_search_functionality():
    headers_auth = {
        "Authorization": AUTH_TOKEN,
        "Accept": "application/json",
    }
    headers_no_auth = {
        "Accept": "application/json",
    }

    # Helper function to perform GET with params and headers
    def get_jobs(params=None, headers=None):
        try:
            resp = requests.get(JOBS_ENDPOINT, headers=headers, params=params, timeout=TIMEOUT)
            return resp
        except RequestException as e:
            assert False, f"RequestException occurred: {e}"

    # 1. Validate that authentication is required - request without auth should fail (401 or 403)
    resp = get_jobs(params={"q": "developer", "location": "New York"}, headers=headers_no_auth)
    assert resp.status_code in (401, 403), f"Expected 401/403 for unauthenticated request, got {resp.status_code}"

    # 2. Authenticated request with valid query parameters returns 200 and relevant jobs
    q_valid = "software engineer"
    location_valid = "San Francisco"
    resp = get_jobs(params={"q": q_valid, "location": location_valid}, headers=headers_auth)
    assert resp.status_code == 200, f"Expected 200 for valid auth request, got {resp.status_code}"
    data = resp.json()
    assert isinstance(data, dict), "Response JSON is not an object"
    assert "results" in data or "jobs" in data, "Response missing expected 'results' or 'jobs' key"
    results = data.get("results") or data.get("jobs") or []
    assert isinstance(results, list), "'results' or 'jobs' field is not a list"
    # Check that some job titles or descriptions contain relevant keywords (basic check)
    matched = any(
        any(keyword.lower() in (job.get("title", "") + job.get("description", "")).lower()
            for keyword in q_valid.split())
        for job in results
    )
    # We allow no results but if results exist, check content relevance
    if results:
        assert matched, "Returned job listings do not match the queried keywords"

    # 3. Query with empty parameters: expect empty results or handled gracefully
    resp = get_jobs(params={"q": "", "location": ""}, headers=headers_auth)
    assert resp.status_code == 200, "Empty query should return 200 OK"
    data_empty = resp.json()
    results_empty = data_empty.get("results") or data_empty.get("jobs") or []
    assert isinstance(results_empty, list), "Empty query results should be a list"
    # The system may return empty or all jobs, no error expected

    # 4. Query with invalid parameters: very long string and potentially malicious input to test input validation and SQL injection
    malicious_input = "' OR 1=1 --"
    params_injection = {"q": malicious_input, "location": malicious_input}
    resp = get_jobs(params=params_injection, headers=headers_auth)
    # Expect either 400 Bad Request if input validation, or 200 with safe handling, but not server error or data leak
    assert resp.status_code in (200, 400), f"Expected 200 or 400 for injection attempt, got {resp.status_code}"
    if resp.status_code == 200:
        data_injection = resp.json()
        results_injection = data_injection.get("results") or data_injection.get("jobs") or []
        assert isinstance(results_injection, list), "Injection query results should be a list"
        # Check that no dangerous data leak happens (e.g. too many results or unusual keys)
        assert len(results_injection) < 1000, "Too many results returned, possible injection vulnerability detected"

    # 5. Test for prompt injection attempt in query parameters (simulate injection in a search prompt)
    prompt_injection = "developer; DROP TABLE jobs;"
    params_prompt = {"q": prompt_injection, "location": "Remote"}
    resp = get_jobs(params=params_prompt, headers=headers_auth)
    assert resp.status_code in (200, 400), f"Expected 200 or 400 for prompt injection attempt, got {resp.status_code}"

    # 6. Rate-limiting/Throttling test: repeatedly call the endpoint to test protection (simulate 5 calls)
    # We do not expect failures here, but if rate limiting exists, it would return 429
    for i in range(5):
        resp_rate = get_jobs(params={"q": "dev", "location": "NY"}, headers=headers_auth)
        assert resp_rate.status_code in (200, 429), f"Unexpected status code {resp_rate.status_code} in rate limit test"

    # 7. Validate CORS headers presence to mitigate CSRF and others
    # This requires an OPTIONS or GET request with Origin header
    cors_headers = {
        "Origin": "http://malicious-site.com",
        "Authorization": AUTH_TOKEN,
    }
    try:
        resp_cors = requests.options(JOBS_ENDPOINT, headers=cors_headers, timeout=TIMEOUT)
        # If OPTIONS not supported, fallback to GET
        if resp_cors.status_code not in (200, 204):
            resp_cors = requests.get(JOBS_ENDPOINT, headers=cors_headers, params={"q": "engineer"}, timeout=TIMEOUT)
    except RequestException as e:
        assert False, f"CORS request failed: {e}"

    # Check Access-Control-Allow-Origin header presence and that it doesn't allow wildcards inappropriately
    allow_origin = resp_cors.headers.get("Access-Control-Allow-Origin")
    assert allow_origin is not None, "CORS missing Access-Control-Allow-Origin header"
    assert allow_origin != "*", "CORS header 'Access-Control-Allow-Origin' should not be wildcard '*' for authenticated endpoint"

    # 8. Validate error handling: provide unexpected parameter type (numeric q parameter)
    resp_error = get_jobs(params={"q": 12345, "location": "NYC"}, headers=headers_auth)
    # Should handle type coercion or return validation error (400)
    assert resp_error.status_code in (200, 400), f"Unexpected response for invalid param type: {resp_error.status_code}"

    print("test_job_search_functionality passed")


test_job_search_functionality()