import requests
import uuid

BASE_URL = "http://localhost:3000/api"
TIMEOUT = 30

# Replace with a valid token for authentication
AUTH_TOKEN = "your_valid_auth_token_here"

HEADERS_AUTH = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

HEADERS_NO_AUTH = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

def test_resume_adaptation_for_job():
    # Step 1: Create a new resume to adapt later
    create_resume_payload = {
        "title": "Test Resume for Adaptation",
        "content": {
            "personal": {
                "name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "555-0100",
                "role": "Software Engineer"
            },
            "experience": [
                {
                    "company": "Test Company",
                    "position": "Developer",
                    "startDate": "2020-01-01",
                    "endDate": "2022-01-01",
                    "summary": "Developed software solutions."
                }
            ],
            "education": [
                {
                    "institution": "Test University",
                    "degree": "BSc Computer Science",
                    "startYear": 2016,
                    "endYear": 2020
                }
            ],
            "skills": ["Python", "Testing", "REST APIs"]
        }
    }

    resume_id = None

    try:
        # Create resume with authentication
        resp_create = requests.post(
            f"{BASE_URL}/resumes",
            json=create_resume_payload,
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        assert resp_create.status_code == 201, f"Resume creation failed: {resp_create.text}"
        created_resume = resp_create.json()
        assert "id" in created_resume, "Response missing resume id"
        resume_id = created_resume["id"]

        # Define valid job description input for adaptation
        job_description_valid = """
        We are looking for a Software Engineer with strong skills in Python, REST APIs, and automated testing. Experience with AI and SaaS platforms is a plus.
        """

        adapt_payload_valid = {
            "jobDescription": job_description_valid
        }

        # Test auth required: call adapt endpoint without auth (should fail)
        resp_no_auth = requests.post(
            f"{BASE_URL}/resumes/{resume_id}/adapt",
            json=adapt_payload_valid,
            headers=HEADERS_NO_AUTH,
            timeout=TIMEOUT
        )
        assert resp_no_auth.status_code == 401 or resp_no_auth.status_code == 403, \
            "Unauthenticated request to adapt endpoint should be rejected"

        # Test with invalid resume id (auth provided) for authorization checks
        invalid_resume_id = str(uuid.uuid4())
        resp_invalid_resume = requests.post(
            f"{BASE_URL}/resumes/{invalid_resume_id}/adapt",
            json=adapt_payload_valid,
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        assert resp_invalid_resume.status_code in {400,403,404}, \
            "Adapt endpoint should reject invalid or unauthorized resume ID"

        # Test with malicious input to detect SQL injection or prompt injection attempts
        malicious_job_description = "'; DROP TABLE resumes; --\n${{exec('rm -rf /')}}"

        adapt_payload_malicious = {
            "jobDescription": malicious_job_description
        }

        resp_malicious = requests.post(
            f"{BASE_URL}/resumes/{resume_id}/adapt",
            json=adapt_payload_malicious,
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        # Expect the server to respond gracefully, no server error or leakage
        assert resp_malicious.status_code in {200,400}, "Server should handle malicious input safely"
        resp_malicious_json = resp_malicious.json()
        # If accepted, make sure no harmful content or error messages are leaked
        assert "error" not in resp_malicious_json or isinstance(resp_malicious_json.get("error"), str), \
            "Error messages must be sanitized"

        # Now test valid adaptation with correct auth and valid job description
        resp_adapt = requests.post(
            f"{BASE_URL}/resumes/{resume_id}/adapt",
            json=adapt_payload_valid,
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        assert resp_adapt.status_code == 200, f"Adaptation failed: {resp_adapt.text}"

        adapted_response = resp_adapt.json()

        # Validate adapted content presence
        assert isinstance(adapted_response, dict), "Response should be a JSON object"
        assert "adaptedResume" in adapted_response, "Response missing 'adaptedResume'"
        assert isinstance(adapted_response["adaptedResume"], dict), "'adaptedResume' should be an object"

        # Validate change log presence and format
        assert "changeLog" in adapted_response, "Response missing 'changeLog'"
        change_log = adapted_response["changeLog"]
        assert isinstance(change_log, list), "'changeLog' should be a list"
        assert len(change_log) > 0, "Change log should not be empty"

        # Security: Validate that response headers include CORS and CSRF protection headers if applicable
        # This requires a separate OPTIONS request and cannot be fully validated here without server headers access
        # But we can at least assert we have authentication applied and no unexpected redirects
        # We can confirm no redirect (3xx) happened
        assert resp_adapt.history == [], "No redirects should occur during adapt request"

        # Test input validation: Adapt endpoint with missing jobDescription field
        resp_missing_field = requests.post(
            f"{BASE_URL}/resumes/{resume_id}/adapt",
            json={},  # missing jobDescription
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        assert resp_missing_field.status_code == 400, "Missing jobDescription should cause 400 Bad Request"

        # Test rate limiting lightly by rapid calls (2 calls in quick succession)
        resp1 = requests.post(
            f"{BASE_URL}/resumes/{resume_id}/adapt",
            json=adapt_payload_valid,
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        resp2 = requests.post(
            f"{BASE_URL}/resumes/{resume_id}/adapt",
            json=adapt_payload_valid,
            headers=HEADERS_AUTH,
            timeout=TIMEOUT
        )
        assert resp1.status_code == 200, "First adapt call should succeed"
        assert resp2.status_code in {200, 429}, "Second adapt call may be rate limited (429) or succeed"

    finally:
        # Cleanup - delete the created resume if it exists
        if resume_id:
            try:
                resp_del = requests.delete(
                    f"{BASE_URL}/resumes/{resume_id}",
                    headers=HEADERS_AUTH,
                    timeout=TIMEOUT
                )
                # Accept 200 OK or 204 No Content as success
                assert resp_del.status_code in {200, 204, 404}, "Resume deletion failed"
            except Exception:
                pass

test_resume_adaptation_for_job()