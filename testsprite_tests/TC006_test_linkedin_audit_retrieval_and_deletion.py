import requests

BASE_URL = "http://localhost:3000/api"
TIMEOUT = 30

# TODO: Replace with a valid Bearer token with proper authentication
AUTH_TOKEN = "Bearer YOUR_VALID_AUTH_TOKEN"

HEADERS = {
    "Authorization": AUTH_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_linkedin_audit_retrieval_and_deletion():
    # Prepare LinkedIn audit creation payload (valid)
    create_payload = {
        "linkedinProfileText": "Experienced software engineer with expertise in Python and AI.",
        "professionalArea": "Software Engineering",
        "targetJob": "AI Engineer"
    }

    audit_id = None

    try:
        # Step 1: Create a new LinkedIn audit to retrieve and delete later
        create_resp = requests.post(
            f"{BASE_URL}/linkedin/audit",
            headers=HEADERS,
            json=create_payload,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Expected 201 Created, got {create_resp.status_code}"
        create_data = create_resp.json()
        assert "id" in create_data, "Response missing 'id'"
        audit_id = create_data["id"]

        # Step 2: Retrieve the created audit with valid ID
        get_resp = requests.get(
            f"{BASE_URL}/linkedin/audit/{audit_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert get_resp.status_code == 200, f"Expected 200 OK on retrieval, got {get_resp.status_code}"
        get_data = get_resp.json()
        # Validate important fields presence
        assert get_data.get("id") == audit_id, "Retrieved audit ID mismatch"
        assert "score" in get_data, "Audit result missing 'score'"
        assert "improvementSuggestions" in get_data, "Audit result missing 'improvementSuggestions'"

        # Step 3: Attempt retrieval with invalid (malformed) audit ID (SQL/Injection test)
        invalid_ids = [
            "12345'; DROP TABLE audits;--",
            "<script>alert('XSS')</script>",
            "' OR '1'='1",
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"  # long string
        ]
        for invalid_id in invalid_ids:
            invalid_get_resp = requests.get(
                f"{BASE_URL}/linkedin/audit/{invalid_id}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            # Should not be 200; expect 400 or 404 or 401 depending on validation and authorization
            assert invalid_get_resp.status_code in (400,404,401,403), f"Invalid ID '{invalid_id}' returned unexpected status {invalid_get_resp.status_code}"

        # Step 4: Attempt retrieval without authorization header (auth bypass test)
        no_auth_resp = requests.get(
            f"{BASE_URL}/linkedin/audit/{audit_id}",
            timeout=TIMEOUT,
        )
        assert no_auth_resp.status_code == 401, f"Expected 401 Unauthorized without token, got {no_auth_resp.status_code}"

        # Step 5: Attempt deletion with valid audit ID and authorization
        delete_resp = requests.delete(
            f"{BASE_URL}/linkedin/audit/{audit_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert delete_resp.status_code in (200,204), f"Expected 200 OK or 204 No Content on delete, got {delete_resp.status_code}"

        # Step 6: Verify deletion by attempting to retrieve again
        post_delete_get_resp = requests.get(
            f"{BASE_URL}/linkedin/audit/{audit_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert post_delete_get_resp.status_code == 404, f"Expected 404 Not Found after deletion, got {post_delete_get_resp.status_code}"

        # Step 7: Attempt deletion with invalid audit IDs and invalid authorization
        for invalid_id in invalid_ids:
            invalid_delete_resp = requests.delete(
                f"{BASE_URL}/linkedin/audit/{invalid_id}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            # Expect 400, 404, 401 or 403 depending on the validation and auth
            assert invalid_delete_resp.status_code in (400,404,401,403), f"Invalid ID delete returned unexpected status {invalid_delete_resp.status_code}"

        no_auth_delete_resp = requests.delete(
            f"{BASE_URL}/linkedin/audit/{audit_id}",
            timeout=TIMEOUT,
        )
        # Since it's deleted, 401 Unauthorized is likely
        assert no_auth_delete_resp.status_code == 401, f"Expected 401 Unauthorized for delete without token, got {no_auth_delete_resp.status_code}"

        # Step 8: Test CORS policy by sending OPTIONS preflight request with custom headers
        cors_resp = requests.options(
            f"{BASE_URL}/linkedin/audit/{audit_id or 'test'}",
            headers={
                "Origin": "http://evil.domain",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization,Content-Type",
            },
            timeout=TIMEOUT,
        )
        # CORS should reject or allow controlled origins: Accept 200 or 403
        assert cors_resp.status_code in (200, 403, 404), f"CORS preflight returned unexpected status {cors_resp.status_code}"

    finally:
        # Cleanup in case audit not deleted
        if audit_id:
            try:
                cleanup_resp = requests.delete(
                    f"{BASE_URL}/linkedin/audit/{audit_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
                # Accept normal deletion responses
                assert cleanup_resp.status_code in (200,204,404)
            except Exception:
                pass


test_linkedin_audit_retrieval_and_deletion()
