import requests
import json

BASE_URL = "http://localhost:3000/api"
TIMEOUT = 30

# These credentials should be valid test user credentials with permission to manage resumes.
AUTH_EMAIL = "testuser@example.com"
AUTH_PASSWORD = "TestPass123!"

def authenticate():
    """Authenticate user via /api/auth and return the auth token."""
    auth_url = f"{BASE_URL}/auth/[...clerk]"  # Corrected auth endpoint as per PRD
    payload = {"email": AUTH_EMAIL, "password": AUTH_PASSWORD}
    try:
        r = requests.post(auth_url, json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        token = data.get("token") or data.get("access_token") or data.get("session_token")
        if not token:
            raise ValueError("Authentication token not returned.")
        return token
    except Exception as e:
        raise RuntimeError(f"Authentication failed: {str(e)}")

def test_resume_crud_operations():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Sample valid resume payload for creation
    valid_resume_payload = {
        "personal_details": {
            "name": "Test User",
            "email": "testuser@example.com",
            "phone": "+1234567890",
            "position": "Software Engineer"
        },
        "professional_experience": [
            {
                "company": "Test Company",
                "position": "Developer",
                "start_date": "2020-01-01",
                "end_date": "2022-01-01",
                "description": "Developed software solutions."
            }
        ],
        "education": [
            {
                "institution": "Test University",
                "degree": "BSc Computer Science",
                "start_date": "2016-08-01",
                "end_date": "2020-05-31"
            }
        ],
        "technical_skills": ["Python", "Django", "React"],
        "projects": [
            {
                "name": "Project Alpha",
                "description": "A sample project."
            }
        ],
        "languages": ["English", "Spanish"],
        "certifications": [
            {
                "name": "Certified Tester",
                "issuer": "Testing Institute",
                "date": "2021-06-01"
            }
        ]
    }

    # Sample invalid payload with SQL Injection attempt and invalid data to test input validation
    invalid_payloads = [
        # SQL Injection attempt
        {
            "personal_details": {
                "name": "Robert'); DROP TABLE resumes;--",
                "email": "bademail@example.com",
                "phone": "1234",
                "position": "Hacker"
            }
        },
        # Missing required fields
        {},
        # Invalid data types
        {
            "personal_details": {
                "name": 12345,
                "email": "invalidemail",
                "phone": None,
                "position": True
            }
        }
    ]

    resume_id = None
    try:
        # 1. CREATE resume with valid data
        resp = requests.post(f"{BASE_URL}/resumes", headers=headers, json=valid_resume_payload, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        created_resume = resp.json()
        resume_id = created_resume.get("id")
        assert resume_id is not None, "Created resume ID missing"
        # Check created data integrity
        for key in valid_resume_payload["personal_details"]:
            assert created_resume["personal_details"].get(key) == valid_resume_payload["personal_details"][key]
        assert isinstance(created_resume.get("professional_experience"), list)
        assert isinstance(created_resume.get("education"), list)

        # 2. RETRIEVE the created resume
        resp = requests.get(f"{BASE_URL}/resumes/{resume_id}", headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}"
        retrieved_resume = resp.json()
        assert retrieved_resume["id"] == resume_id
        assert retrieved_resume["personal_details"]["name"] == valid_resume_payload["personal_details"]["name"]

        # 3. UPDATE the resume with partial data to test update and validate authorization
        update_payload = {"personal_details": {"phone": "+1987654321"}}
        resp = requests.put(f"{BASE_URL}/resumes/{resume_id}", headers=headers, json=update_payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK on update, got {resp.status_code}"
        updated_resume = resp.json()
        assert updated_resume["personal_details"]["phone"] == "+1987654321"

        # 4. TEST UPDATE with invalid data to check input validation and security (SQL Injection attempt)
        resp = requests.put(f"{BASE_URL}/resumes/{resume_id}", headers=headers, json=invalid_payloads[0], timeout=TIMEOUT)
        # Expect 400 Bad Request or validation error, no 500 or 200
        assert resp.status_code in [400, 422], f"Expected 400 or 422 on invalid update, got {resp.status_code}"

        # 5. TEST unauthorized access
        # No auth header request - GET resumes list or specific resume, expect 401 or 403
        resp = requests.get(f"{BASE_URL}/resumes/{resume_id}", timeout=TIMEOUT)
        assert resp.status_code in [401,403], f"Expected 401 or 403 without auth, got {resp.status_code}"

        # 6. TEST creation with invalid payloads
        for invalid_payload in invalid_payloads:
            resp = requests.post(f"{BASE_URL}/resumes", headers=headers, json=invalid_payload, timeout=TIMEOUT)
            assert resp.status_code in [400,422], f"Expected 400 or 422 for invalid creation, got {resp.status_code}"

        # 7. DELETE the resume
        resp = requests.delete(f"{BASE_URL}/resumes/{resume_id}", headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 204, f"Expected 204 No Content on delete, got {resp.status_code}"

        # 8. Confirm deletion: GET should return 404 or 403
        resp = requests.get(f"{BASE_URL}/resumes/{resume_id}", headers=headers, timeout=TIMEOUT)
        assert resp.status_code in [404,403], f"Expected 404 or 403 after delete, got {resp.status_code}"

    finally:
        # Cleanup just in case test failed before delete
        if resume_id:
            try:
                requests.delete(f"{BASE_URL}/resumes/{resume_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_resume_crud_operations()
