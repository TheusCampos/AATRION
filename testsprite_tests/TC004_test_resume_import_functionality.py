import requests
from io import BytesIO

BASE_URL = "http://localhost:3000/api"
IMPORT_ENDPOINT = f"{BASE_URL}/resumes/import"
UPLOAD_TIMEOUT = 30

# Set your auth token here for the authenticated calls
AUTH_TOKEN = "your_valid_auth_token_here"

headers_auth = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
}

def test_resume_import_functionality():
    # Valid PDF and DOCX files (minimal valid content)
    sample_pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n"
        b"4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 24 Tf 100 100 Td (Test PDF Resume) Tj ET\nendstream\nendobj\n"
        b"xref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000210 00000 n \n"
        b"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n300\n%%EOF\n"
    )
    sample_docx_content = (
        b"PK\x03\x04\x14\x00\x06\x00"
        b"docProps/core.xml"
        b"word/document.xml"
        b"[Content_Types].xml"
    )  # Minimal invalid but recognizable DOCX header (ZIP based)

    def attempt_import(file_bytes, filename, content_type):
        files = {
            'file': (filename, BytesIO(file_bytes), content_type)
        }
        try:
            resp = requests.post(IMPORT_ENDPOINT, headers=headers_auth, files=files, timeout=UPLOAD_TIMEOUT)
            return resp
        except requests.RequestException as e:
            raise AssertionError(f"Request failed with error: {e}")

    # Test 1: Upload valid PDF
    resp_pdf = attempt_import(sample_pdf_content, "resume.pdf", "application/pdf")
    assert resp_pdf.status_code == 200, f"Valid PDF upload failed with status {resp_pdf.status_code}"
    data_pdf = resp_pdf.json()
    # Assuming API returns extracted resume details with keys such as 'id' and 'content'
    assert isinstance(data_pdf, dict), "Response is not a JSON object"
    assert "id" in data_pdf, "Response missing 'id' key for imported resume"
    assert "content" in data_pdf, "Response missing 'content' key for imported resume"
    assert isinstance(data_pdf["content"], str) and len(data_pdf["content"]) > 0, "Extracted content empty for PDF"

    # Test 2: Upload valid DOCX
    resp_docx = attempt_import(sample_docx_content, "resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    assert resp_docx.status_code == 200, f"Valid DOCX upload failed with status {resp_docx.status_code}"
    data_docx = resp_docx.json()
    assert isinstance(data_docx, dict), "Response is not a JSON object"
    assert "id" in data_docx, "Response missing 'id' key for imported resume"
    assert "content" in data_docx, "Response missing 'content' key for imported resume"
    assert isinstance(data_docx["content"], str) and len(data_docx["content"]) > 0, "Extracted content empty for DOCX"

    # Test 3: Upload invalid file type (e.g. .exe)
    invalid_file_content = b"MZ\x90\x00\x03\x00\x00\x00"
    files = {
        'file': ("malicious.exe", BytesIO(invalid_file_content), "application/x-msdownload")
    }
    resp_invalid = requests.post(IMPORT_ENDPOINT, headers=headers_auth, files=files, timeout=UPLOAD_TIMEOUT)
    assert resp_invalid.status_code in (400, 415), f"Invalid filetype not rejected, got status {resp_invalid.status_code}"
    resp_body = resp_invalid.json()
    assert "error" in resp_body or "message" in resp_body, "Error message missing for invalid file upload"

    # Test 4: Upload no file
    resp_no_file = requests.post(IMPORT_ENDPOINT, headers=headers_auth, timeout=UPLOAD_TIMEOUT)
    assert resp_no_file.status_code == 400, f"No file upload should return 400, got {resp_no_file.status_code}"
    body_no_file = resp_no_file.json()
    assert "error" in body_no_file or "message" in body_no_file, "Error message missing for no file upload"

    # Test 5: Authentication bypass test - no auth header
    resp_no_auth = requests.post(IMPORT_ENDPOINT, files={
        'file': ("resume.pdf", BytesIO(sample_pdf_content), "application/pdf")
    }, timeout=UPLOAD_TIMEOUT)
    assert resp_no_auth.status_code == 401 or resp_no_auth.status_code == 403, "Unauthenticated request should be rejected"

    # Test 6: Malicious input test - filename SQL injection attempt
    sql_injection_filename = "resume'; DROP TABLE users;--.pdf"
    resp_sql_injection = attempt_import(sample_pdf_content, sql_injection_filename, "application/pdf")
    assert resp_sql_injection.status_code == 400 or resp_sql_injection.status_code == 422 or resp_sql_injection.status_code == 200, \
        "SQL injection attempt filename should not cause server error"
    if resp_sql_injection.status_code == 200:
        data_sql = resp_sql_injection.json()
        assert "id" in data_sql and "content" in data_sql, "SQL injection filename accepted but response invalid"

    # Test 7: Large file upload rate limiting or response
    # Create a large dummy PDF-ish byte content (~5MB)
    large_pdf_content = b"%PDF-1.4\n" + b"0" * (5 * 1024 * 1024)
    resp_large = attempt_import(large_pdf_content, "large_resume.pdf", "application/pdf")
    assert resp_large.status_code in (200, 413, 429), "Large file should be accepted or rejected with proper status"
    if resp_large.status_code == 200:
        data_large = resp_large.json()
        assert "id" in data_large and "content" in data_large, "Large file import success response invalid"

    # Test 8: CORS preflight OPTIONS request with valid origin
    options_headers = {
        "Origin": "http://trusted-origin.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization,Content-Type",
    }
    resp_options = requests.options(IMPORT_ENDPOINT, headers=options_headers, timeout=UPLOAD_TIMEOUT)
    assert resp_options.status_code in (200, 204), "OPTIONS preflight should be handled properly"
    cors_headers = resp_options.headers
    assert "Access-Control-Allow-Origin" in cors_headers and cors_headers["Access-Control-Allow-Origin"] != "", "CORS allow origin missing"
    assert "Access-Control-Allow-Methods" in cors_headers, "CORS allow methods missing"
    assert "POST" in cors_headers["Access-Control-Allow-Methods"], "POST method not allowed in CORS"

    # Test 9: CSRF prevention check - POST without auth but with CSRF token simulation (should still fail auth)
    # Assuming CSRF token sent in header 'X-CSRF-Token'
    csrf_headers = {
        "X-CSRF-Token": "dummy_token"
    }
    resp_csrf = requests.post(IMPORT_ENDPOINT, headers=csrf_headers, files={
        'file': ("resume.pdf", BytesIO(sample_pdf_content), "application/pdf")
    }, timeout=UPLOAD_TIMEOUT)
    assert resp_csrf.status_code == 401 or resp_csrf.status_code == 403, "CSRF token alone without auth should not bypass auth"

test_resume_import_functionality()