# Redinent API Test Cases (Readable Format with Test Parameters)

This document is written for easy execution by juniors and review by stakeholders.
Each case includes:
- `Where to enter data` (Body / Query / Header / Path)
- `Test Data`
- `Action`
- `Expected Result`

## Test Environment Inputs (Common for Most Cases)
- Base URL: `http://127.0.0.1:3000`
- Valid User Email: `c.rajsekhar@redinent.com`
- Valid User Password: `Redinent@2025#`
- Invalid Password: `WrongPass@123`
- Invalid Email: `invalid.user@redinent.local`
- Valid API Key: `<get from tenant config>`
- Invalid API Key: `invalid-api-key`
- Sample UID: `sample-uid`
- Sample CVE ID: `CVE-2022-8902`
- Sample CWE ID: `1277`
- Sample IP: `10.10.10.10`
- Sample Location: `Bangalore`
- Sample Latitude: `12.9716`
- Sample Longitude: `77.5946`
- Sample Device Type: `camera`

## 1) Functional API Test Cases

### TC-FUNC-001: Verify successful API login
- Endpoint: `POST /api/users/sign_in`
- Where to enter data:
  - Body (JSON): `user.email`, `user.password`
- Test Data:
```json
{
  "user": {
    "email": "c.rajsekhar@redinent.com",
    "password": "Redinent@2025#"
  }
}
```
- Action: Send POST request with valid credentials.
- Expected Result: `200 OK`, `success: true`, user details in `response`.

### TC-FUNC-002: Verify locations retrieval
- Endpoint: `GET /api/reports/get_locations`
- Where to enter data: No input required.
- Test Data: N/A
- Action: Send GET request.
- Expected Result: `200 OK` with `data` array and `status: success`.

### TC-FUNC-003: Verify device count retrieval with valid filters
- Endpoint: `GET /api/reports/get_device_count`
- Where to enter data:
  - Query params: `location`, `latitude`, `longitude`, `device_type`
- Test Data:
  - `location=Bangalore`
  - `latitude=12.9716`
  - `longitude=77.5946`
  - `device_type=camera`
- Action: Send GET request with all required query parameters.
- Expected Result: `200 OK` and valid report data.

### TC-FUNC-004: Verify model numbers retrieval
- Endpoint: `GET /api/reports/model_numbers`
- Where to enter data:
  - Query params: `location`, `latitude`, `longitude`, `device_type`, `oem`
- Test Data:
  - `location=Bangalore`
  - `latitude=12.9716`
  - `longitude=77.5946`
  - `device_type=camera`
  - `oem=Hikvision`
- Action: Send GET request with required query parameters.
- Expected Result: `200 OK` with model-level data.

### TC-FUNC-005: Verify open ports retrieval
- Endpoint: `GET /api/reports/open_ports`
- Where to enter data:
  - Query params: `location`, `latitude`, `longitude`, `device_type`
- Test Data:
  - Same as TC-FUNC-003
- Action: Send GET request.
- Expected Result: `200 OK` with open port/service information.

### TC-FUNC-006: Verify VAPT counts retrieval
- Endpoint: `GET /api/reports/vapt_counts`
- Where to enter data:
  - Query params: `location`, `latitude`, `longitude`, `device_type`
- Test Data:
  - Same as TC-FUNC-003
- Action: Send GET request.
- Expected Result: `200 OK` with verified/unverified and severity-related counts.

### TC-FUNC-007: Verify alerts trend retrieval
- Endpoint: `GET /api/reports/alerts`
- Where to enter data:
  - Query params: `location`, `latitude`, `longitude`, `device_type`
- Test Data:
  - Same as TC-FUNC-003
- Action: Send GET request.
- Expected Result: `200 OK`, 12-month trend payload.

### TC-FUNC-008: Verify vulnerable hosts retrieval
- Endpoint: `GET /api/reports/vulnerable_hosts`
- Where to enter data:
  - Query params: `location`, `latitude`, `longitude`, `device_type`
- Test Data:
  - Same as TC-FUNC-003
- Action: Send GET request.
- Expected Result: `200 OK` with vulnerable/non-vulnerable counts.

### TC-FUNC-009: Verify API key-based scan details retrieval
- Endpoint: `GET /reports/api_scan_details`
- Where to enter data:
  - Query params: `api_key`, `uid`
- Test Data:
  - `api_key=<VALID_API_KEY>`
  - `uid=sample-uid`
- Action: Send GET request.
- Expected Result: Success payload with scan details.

### TC-FUNC-010: Verify CVE details retrieval
- Endpoint: `GET /reports/api_cve_details`
- Where to enter data:
  - Query params: `api_key`, `cve_id`
- Test Data:
  - `api_key=<VALID_API_KEY>`
  - `cve_id=CVE-2022-8902`
- Action: Send GET request.
- Expected Result: Success payload with CVE details.

### TC-FUNC-011: Verify CWE details retrieval
- Endpoint: `GET /reports/api_cwe_details`
- Where to enter data:
  - Query params: `api_key`, `cwe_id`
- Test Data:
  - `api_key=<VALID_API_KEY>`
  - `cwe_id=1277`
- Action: Send GET request.
- Expected Result: Success payload with CWE details.

### TC-FUNC-012: Verify device details retrieval
- Endpoint: `GET /reports/api_device_details`
- Where to enter data:
  - Query params: `api_key`, `ip`
- Test Data:
  - `api_key=<VALID_API_KEY>`
  - `ip=10.10.10.10`
- Action: Send GET request.
- Expected Result: Success payload with device details.

## 2) Negative & Edge Case API Test Cases

### TC-NEG-001: Missing required report parameters
- Endpoint: `GET /api/reports/get_device_count`
- Where to enter data:
  - Query params (send partial only)
- Test Data:
  - `location=Bangalore` only (omit latitude/longitude/device_type)
- Action: Send GET request with missing mandatory query params.
- Expected Result: `400 Bad Request` with missing parameter message.

### TC-NEG-002: Invalid login credentials
- Endpoint: `POST /api/users/sign_in`
- Where to enter data:
  - Body JSON
- Test Data:
```json
{
  "user": {
    "email": "c.rajsekhar@redinent.com",
    "password": "WrongPass@123"
  }
}
```
- Action: Send POST request.
- Expected Result: Authentication failure response.

### TC-NEG-003: Invalid email format
- Endpoint: `POST /api/users/sign_in`
- Where to enter data:
  - Body JSON
- Test Data:
```json
{
  "user": {
    "email": "invalid-email-format",
    "password": "Redinent@2025#"
  }
}
```
- Action: Send POST request.
- Expected Result: Safe failure/validation response.

### TC-NEG-004: Missing login payload object
- Endpoint: `POST /api/users/sign_in`
- Where to enter data:
  - Body JSON
- Test Data:
```json
{}
```
- Action: Send POST request without required object.
- Expected Result: Validation/auth failure and no session.

### TC-NEG-005: Non-existent user login attempt
- Endpoint: `POST /api/users/sign_in`
- Where to enter data:
  - Body JSON
- Test Data:
```json
{
  "user": {
    "email": "invalid.user@redinent.local",
    "password": "Redinent@2025#"
  }
}
```
- Action: Send POST request.
- Expected Result: Authentication fails without user-enumeration leakage.

### TC-NEG-006: Invalid data type in query
- Endpoint: `GET /api/reports/get_device_count`
- Where to enter data:
  - Query params
- Test Data:
  - `location=Bangalore`
  - `latitude=abc`
  - `longitude=xyz`
  - `device_type=camera`
- Action: Send GET request.
- Expected Result: Safe validation handling (error or controlled response).

### TC-NEG-007: Excessively long query input
- Endpoint: `GET /api/reports/get_device_count`
- Where to enter data:
  - Query params
- Test Data:
  - `location=` 500-char string
  - `latitude=12.9716`
  - `longitude=77.5946`
  - `device_type=camera`
- Action: Send GET request.
- Expected Result: API rejects/sanitizes safely without crash.

### TC-NEG-008: Invalid API key for protected report endpoint
- Endpoint: `GET /reports/api_scan_details`
- Where to enter data:
  - Query params
- Test Data:
  - `api_key=invalid-api-key`
  - `uid=sample-uid`
- Action: Send GET request.
- Expected Result: Unauthorized denial response.

### TC-NEG-009: Missing API key for protected endpoint
- Endpoint: `GET /reports/api_scan_details`
- Where to enter data:
  - Query params
- Test Data:
  - `uid=sample-uid` only
- Action: Send GET request.
- Expected Result: "API key missing" style response.

### TC-NEG-010: Non-existent resource identifier
- Endpoint: `GET /reports/api_cve_details`
- Where to enter data:
  - Query params
- Test Data:
  - `api_key=<VALID_API_KEY>`
  - `cve_id=CVE-0000-0000`
- Action: Send GET request.
- Expected Result: Safe "No data found" response.

### TC-EDGE-001: Empty dataset behavior
- Endpoint: `GET /api/reports/get_locations`
- Where to enter data: No input.
- Test Data: Execute in empty dataset environment.
- Action: Send GET request.
- Expected Result: `200 OK` with empty list.

### TC-EDGE-002: Boundary string length
- Endpoint: Text-input endpoints
- Where to enter data:
  - Query/body fields with length constraints
- Test Data:
  - Value at max length
  - Value at max+1 length
- Action: Send two requests.
- Expected Result: Max accepted; max+1 rejected.

### TC-EDGE-003: Unicode/special character handling
- Endpoint: report filters and text fields
- Where to enter data:
  - Query/body text fields
- Test Data:
  - `location=Bengaluru-日本語-テスト-#@!`
- Action: Send request with Unicode special chars.
- Expected Result: Input handled safely and consistently.

### TC-EDGE-004: Repeated request idempotency check
- Endpoint: relevant mutating endpoint
- Where to enter data:
  - Request body/query same payload repeatedly
- Test Data:
  - Same payload sent 5-10 times quickly
- Action: Re-send same request rapidly.
- Expected Result: No unintended duplicate side effects.

## 3) Security API Test Cases

### TC-SEC-001: Authentication enforcement on protected endpoints
- Endpoint: `/reports/api_scan_details`
- Where to enter data:
  - Query params (without api_key)
- Test Data:
  - `uid=sample-uid`
- Action: Send request without valid auth key.
- Expected Result: Access denied.

### TC-SEC-002: SQL injection attempt in query parameters
- Endpoint: `/api/reports/get_device_count`
- Where to enter data:
  - Query params
- Test Data:
  - `location=' OR 1=1 --`
  - `latitude=12.9716`
  - `longitude=77.5946`
  - `device_type=camera`
- Action: Send malicious query input.
- Expected Result: Input handled safely; no injection execution.

### TC-SEC-003: API key tampering
- Endpoint: `/reports/api_scan_details`
- Where to enter data:
  - Query params
- Test Data:
  - Tampered key (e.g., remove last 3 chars)
  - `uid=sample-uid`
- Action: Send request with tampered key.
- Expected Result: Request denied.

### TC-SEC-004: Privilege escalation attempt
- Endpoint: admin-sensitive endpoints
- Where to enter data:
  - Headers/body role hints (if any)
- Test Data:
  - low-privilege user context
- Action: Attempt admin-only operation.
- Expected Result: Forbidden/denied response.

### TC-SEC-005: Excessive data exposure check
- Endpoint: login/report endpoints
- Where to enter data: N/A
- Test Data: Normal valid request payloads.
- Action: Inspect responses for sensitive fields.
- Expected Result: No secret/password/hash leakage.

### TC-SEC-006: Rate limiting check
- Endpoint: `POST /api/users/sign_in`
- Where to enter data:
  - Body JSON, repeated rapidly
- Test Data:
  - 50+ requests in short interval
- Action: Burst login requests.
- Expected Result: Throttle/guard behavior enabled.

### TC-SEC-007: Broken object authorization check
- Endpoint: object-specific endpoints
- Where to enter data:
  - Query/path IDs
- Test Data:
  - valid credentials + unauthorized object ID
- Action: Access object not owned by user/tenant.
- Expected Result: Access denied.

### TC-SEC-008: Input validation hardening
- Endpoint: all user-input endpoints
- Where to enter data:
  - Query/body fields
- Test Data:
  - `<script>alert(1)</script>`
  - encoded payloads `%27%20OR%201%3D1--`
- Action: Submit attack-like payloads.
- Expected Result: Safe handling, no exploit execution.

## 4) Chained / Workflow API Test Cases

### TC-WF-001: Login -> Fetch Locations -> Fetch Device Count
- Where to enter data:
  - Step1 Body: login credentials
  - Step2 No input
  - Step3 Query: use value from step2 + lat/long/device_type
- Test Data:
  - Login: valid user/pass
  - Device count query: one location from Step2
- Action:
  1. Login.
  2. Fetch locations.
  3. Fetch device count using selected location.
- Expected Result: Full workflow succeeds with consistent related data.

### TC-WF-002: Login -> Protected Report Detail (Valid API Key)
- Where to enter data:
  - Body (login)
  - Query (`api_key`, `uid`)
- Test Data:
  - valid credentials
  - valid api_key
  - sample uid
- Action:
  1. Login.
  2. Call scan details endpoint with valid key and UID.
- Expected Result: Protected details returned successfully.

### TC-WF-003: Invalid Auth -> Protected Endpoint Access Attempt
- Where to enter data:
  - Body invalid login
  - Query protected endpoint call
- Test Data:
  - invalid password
  - no/invalid api_key
- Action:
  1. Login fails.
  2. Attempt protected endpoint access.
- Expected Result: Access blocked end-to-end.

### TC-WF-004: Report Query Validation Workflow
- Where to enter data:
  - Query params for same endpoint in two attempts
- Test Data:
  - attempt1: missing required params
  - attempt2: full valid params
- Action:
  1. Trigger validation failure.
  2. Correct payload and retry.
- Expected Result: First fails with clear message; second succeeds.

### TC-WF-005: API Key Validation Workflow
- Where to enter data:
  - Query params `api_key`, `uid`
- Test Data:
  - attempt1: invalid api_key
  - attempt2: valid api_key
- Action:
  1. Call with invalid key.
  2. Call with valid key.
- Expected Result: Unauthorized then success.

## 5) Current Automation Mapping (Quick Reference)

Automated now in framework:
- TC-FUNC-001
- TC-FUNC-002
- TC-FUNC-003
- TC-NEG-001
- TC-NEG-002
- TC-NEG-008
- TC-WF-001 (partial)
- Contract and baseline performance are covered in dedicated suites.

