# Redinent API Automation Test Catalog

Status legend:
- `Automated`
- `Partially Automated`
- `Pending`

| ID | Test Case | Priority | Tags | Status |
|---|---|---|---|---|
| AUTH-001 | Valid login via `POST /api/users/sign_in` returns success and user payload | P0 | `@smoke @sanity @auth` | Automated |
| AUTH-002 | Invalid password returns failure message | P0 | `@security @auth @negative` | Automated |
| AUTH-003 | Unknown email returns failure message | P1 | `@security @auth @negative` | Partially Automated |
| AUTH-004 | Missing `user.email`/`user.password` validation | P1 | `@regression @auth @negative` | Pending |
| AUTH-005 | Disabled user cannot log in | P1 | `@security @auth @rbac` | Pending |
| AUTH-006 | Role field correctness in login response | P2 | `@regression @auth` | Pending |
| AUTH-007 | `X-User-Email` + `X-User-Token` auth header flow | P1 | `@regression @auth` | Pending |
| AUTH-008 | Logout/sign-out invalidates token/session | P2 | `@regression @auth` | Pending |
| RPT-001 | `GET /api/reports/get_locations` schema-valid response | P0 | `@regression @reports @schema` | Automated |
| RPT-002 | `GET /api/reports/get_device_count_all` valid params behavior | P1 | `@regression @reports` | Pending |
| RPT-003 | `GET /api/reports/get_device_count` valid params behavior | P0 | `@regression @reports` | Automated |
| RPT-004 | `GET /api/reports/model_numbers` valid params behavior | P1 | `@regression @reports` | Pending |
| RPT-005 | `GET /api/reports/open_ports` response shape | P1 | `@regression @reports` | Pending |
| RPT-006 | `GET /api/reports/vapt_counts` response fields | P1 | `@regression @reports` | Pending |
| RPT-007 | `GET /api/reports/alerts` 12-month trend correctness | P1 | `@regression @reports` | Pending |
| RPT-008 | `GET /api/reports/vulnerable_hosts` counts correctness | P1 | `@regression @reports` | Pending |
| RPT-009 | Missing required query params return `400` | P0 | `@security @negative @reports` | Automated |
| RPT-010 | Invalid param formats handled safely | P1 | `@security @negative @reports` | Pending |
| RPT-011 | Large dataset response-time SLA | P1 | `@perf @reports` | Pending |
| RPT-012 | Deterministic results for repeated calls | P2 | `@regression @reports` | Pending |
| APIKEY-001 | `/reports/api_scan_details` valid `api_key` + `uid` success path | P1 | `@regression @apikey` | Pending |
| APIKEY-002 | `/reports/api_scan_details` invalid `api_key` unauthorized | P0 | `@security @apikey @rbac` | Automated |
| APIKEY-003 | `/reports/api_scan_details` missing `api_key` | P1 | `@security @apikey @negative` | Pending |
| APIKEY-004 | `/reports/api_cve_details` valid/invalid/missing `cve_id` | P1 | `@regression @apikey` | Pending |
| APIKEY-005 | `/reports/api_cwe_details` valid/invalid/missing `cwe_id` | P1 | `@regression @apikey` | Pending |
| APIKEY-006 | `/reports/api_device_details` valid/invalid/missing `ip` | P1 | `@regression @apikey` | Pending |
| SEC-001 | OWASP API1 BOLA checks | P0 | `@security @owasp` | Pending |
| SEC-002 | OWASP API2 broken authentication checks | P0 | `@security @owasp` | Partially Automated |
| SEC-003 | OWASP API3 excessive data exposure checks | P1 | `@security @owasp` | Pending |
| SEC-004 | OWASP API4 rate limiting/throttling behavior | P1 | `@security @owasp @perf` | Pending |
| SEC-005 | OWASP API8 security misconfiguration checks | P1 | `@security @owasp` | Pending |
| SEC-006 | Injection checks on query params | P0 | `@security @owasp @negative` | Pending |
| SEC-007 | Response header security baseline | P2 | `@security` | Pending |
| SEC-008 | Correlation ID propagation validation | P2 | `@security @observability` | Pending |
| RBAC-001 | `sa` role can access admin-only operations | P1 | `@regression @rbac` | Pending |
| RBAC-002 | Non-admin role restrictions enforced | P0 | `@security @rbac` | Partially Automated |
| RBAC-003 | Privilege escalation attempt blocked | P0 | `@security @rbac` | Pending |
| CON-001 | Pact contract for `/api/users/sign_in` | P0 | `@contract` | Automated |
| CON-002 | Pact contract for `/api/reports/get_locations` | P1 | `@contract @reports` | Pending |
| CON-003 | Pact contract for `/api/reports/get_device_count` error `400` | P1 | `@contract @reports` | Pending |
| PERF-001 | k6 smoke for login + locations | P1 | `@perf` | Automated (script ready) |
| PERF-002 | Load profile for report APIs | P1 | `@perf` | Pending |
| PERF-003 | Spike profile for alerts/vapt endpoints | P2 | `@perf` | Pending |
| PERF-004 | Soak profile for report APIs | P2 | `@perf` | Pending |
| RES-001 | Retry behavior on transient 5xx/timeout | P1 | `@resilience` | Pending |
| RES-002 | Timeout failure behavior and evidence capture | P1 | `@resilience` | Pending |
| RES-003 | Idempotency checks on repeat-safe operations | P2 | `@resilience` | Pending |
| DATA-001 | Zod schema validation for critical responses | P1 | `@regression @schema` | Partially Automated |
| DATA-002 | Pagination/sorting/filter consistency | P2 | `@regression` | Pending |
| DATA-003 | Backward compatibility checks for existing API consumers | P1 | `@contract @regression` | Pending |

## Suggested Phase Plan
- Phase 1 (P0 baseline): AUTH-001, AUTH-002, RPT-001, RPT-003, RPT-009, APIKEY-002, CON-001
- Phase 2 (P1 depth): APIKEY-001/003/004/005/006, RPT-002/004/005/006/007/008/010/011, SEC-002/003/004/006, DATA-001
- Phase 3 (hardening): remaining P2 and resilience/performance long-run suites
