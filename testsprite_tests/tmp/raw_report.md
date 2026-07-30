
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Gerador-curriculo-2.0
- **Date:** 2026-07-21
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 test_resume_crud_operations
- **Test Code:** [TC001_test_resume_crud_operations.py](./TC001_test_resume_crud_operations.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 17, in authenticate
  File "/var/lang/lib/python3.12/site-packages/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: http://localhost:3000/api/auth/%5B...clerk%5D

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 159, in <module>
  File "<string>", line 27, in test_resume_crud_operations
  File "<string>", line 24, in authenticate
RuntimeError: Authentication failed: 404 Client Error: Not Found for url: http://localhost:3000/api/auth/%5B...clerk%5D

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/5bdf8307-0f0b-4fb1-bb3c-f2a41e250c6f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 test_ats_analysis_with_ai
- **Test Code:** [TC002_test_ats_analysis_with_ai.py](./TC002_test_ats_analysis_with_ai.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 172, in <module>
  File "<string>", line 14, in test_ats_analysis_with_ai
  File "<string>", line 11, in get_auth_token
NotImplementedError: Provide an auth token retrieval method here

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/3ee92713-822e-4328-8654-2b32840c50d6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 test_resume_adaptation_for_job
- **Test Code:** [TC003_test_resume_adaptation_for_job.py](./TC003_test_resume_adaptation_for_job.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 185, in <module>
  File "<string>", line 63, in test_resume_adaptation_for_job
AssertionError: Resume creation failed: {"error":"Não autenticado"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/76d75b0f-9e1f-4977-857e-96b717274b14
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 test_resume_import_functionality
- **Test Code:** [TC004_test_resume_import_functionality.py](./TC004_test_resume_import_functionality.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 125, in <module>
  File "<string>", line 45, in test_resume_import_functionality
AssertionError: Valid PDF upload failed with status 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/36ded7be-3ece-4e7e-be58-3d43a4fd0854
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 test_linkedin_audit_creation_and_listing
- **Test Code:** [TC005_test_linkedin_audit_creation_and_listing.py](./TC005_test_linkedin_audit_creation_and_listing.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 99, in <module>
  File "<string>", line 38, in test_linkedin_audit_creation_and_listing
AssertionError: Authenticated valid POST failed, status 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/02144578-0358-4bf9-81a1-b07fdce7e266
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 test_linkedin_audit_retrieval_and_deletion
- **Test Code:** [TC006_test_linkedin_audit_retrieval_and_deletion.py](./TC006_test_linkedin_audit_retrieval_and_deletion.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 135, in <module>
  File "<string>", line 33, in test_linkedin_audit_retrieval_and_deletion
AssertionError: Expected 201 Created, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/a9da07c5-2f1c-4bc1-bf54-3de62822a493
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 test_job_search_functionality
- **Test Code:** [TC007_test_job_search_functionality.py](./TC007_test_job_search_functionality.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 113, in <module>
  File "<string>", line 37, in test_job_search_functionality
AssertionError: Expected 200 for valid auth request, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/df906903-d568-4430-b827-4c6d6227fe86
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 test_user_settings_retrieval_and_update
- **Test Code:** [TC008_test_user_settings_retrieval_and_update.py](./TC008_test_user_settings_retrieval_and_update.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 114, in <module>
  File "<string>", line 32, in test_user_settings_retrieval_and_update
AssertionError: Expected 200 on authenticated GET, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/af737b4a-df97-4e97-bb1d-a92721edaac2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 test_health_check_endpoint
- **Test Code:** [TC009_test_health_check_endpoint.py](./TC009_test_health_check_endpoint.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 83, in <module>
  File "<string>", line 14, in test_health_check_endpoint
AssertionError: Expected HTTP 200 OK, got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/acafdf79-0e7a-4292-8df4-8a94bc00ed4b/c48b38cf-f46b-4c30-9967-9bc7d9b7c8dd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---