# Redinent API Traceability Matrix

| Module | Endpoint | Case ID | Type | Priority | Automation Status | Owner | Sprint |
|---|---|---|---|---|---|---|---|
| Authentication | `POST /api/users/sign_in` | AUTH-001 | Positive | P0 | Automated | QE API Team | Sprint-0 |
| Authentication | `POST /api/users/sign_in` | AUTH-002 | Negative | P0 | Automated | QE API Team | Sprint-0 |
| Authentication | `POST /api/users/sign_in` | AUTH-003 | Negative | P1 | Partially Automated | QE API Team | Sprint-1 |
| Authentication | `POST /api/users/sign_in` | AUTH-004 | Negative | P1 | Pending | QE API Team | Sprint-1 |
| Authentication | `POST /api/users/sign_in` | AUTH-005 | Negative | P1 | Pending | QE API Team | Sprint-2 |
| Authentication | `POST /api/users/sign_in` | AUTH-006 | Positive | P2 | Pending | QE API Team | Sprint-2 |
| Authentication | `* (token header flow)` | AUTH-007 | Positive | P1 | Pending | QE API Team | Sprint-2 |
| Authentication | `DELETE /api/users/sign_out` (if enabled) | AUTH-008 | Positive | P2 | Pending | QE API Team | Sprint-3 |
| Reports API | `GET /api/reports/get_locations` | RPT-001 | Positive | P0 | Automated | QE API Team | Sprint-0 |
| Reports API | `GET /api/reports/get_device_count_all` | RPT-002 | Positive | P1 | Pending | QE API Team | Sprint-1 |
| Reports API | `GET /api/reports/get_device_count` | RPT-003 | Positive | P0 | Automated | QE API Team | Sprint-0 |
| Reports API | `GET /api/reports/model_numbers` | RPT-004 | Positive | P1 | Pending | QE API Team | Sprint-1 |
| Reports API | `GET /api/reports/open_ports` | RPT-005 | Positive | P1 | Pending | QE API Team | Sprint-1 |
| Reports API | `GET /api/reports/vapt_counts` | RPT-006 | Positive | P1 | Pending | QE API Team | Sprint-1 |
| Reports API | `GET /api/reports/alerts` | RPT-007 | Positive | P1 | Pending | QE API Team | Sprint-2 |
| Reports API | `GET /api/reports/vulnerable_hosts` | RPT-008 | Positive | P1 | Pending | QE API Team | Sprint-2 |
| Reports API | `GET /api/reports/get_device_count` | RPT-009 | Negative | P0 | Automated | QE API Team | Sprint-0 |
| Reports API | `GET /api/reports/*` | RPT-010 | Negative | P1 | Pending | QE API Team | Sprint-2 |
| Reports API | `GET /api/reports/*` | RPT-011 | Edge | P1 | Pending | QE API Team | Sprint-3 |
| Reports API | `GET /api/reports/*` | RPT-012 | Edge | P2 | Pending | QE API Team | Sprint-3 |
| API Key Reports | `GET /reports/api_scan_details` | APIKEY-001 | Positive | P1 | Pending | QE API Team | Sprint-1 |
| API Key Reports | `GET /reports/api_scan_details` | APIKEY-002 | Negative | P0 | Automated | QE API Team | Sprint-0 |
| API Key Reports | `GET /reports/api_scan_details` | APIKEY-003 | Negative | P1 | Pending | QE API Team | Sprint-1 |
| API Key Reports | `GET /reports/api_cve_details` | APIKEY-004 | Positive/Negative | P1 | Pending | QE API Team | Sprint-2 |
| API Key Reports | `GET /reports/api_cwe_details` | APIKEY-005 | Positive/Negative | P1 | Pending | QE API Team | Sprint-2 |
| API Key Reports | `GET /reports/api_device_details` | APIKEY-006 | Positive/Negative | P1 | Pending | QE API Team | Sprint-2 |
| Security (OWASP) | `Cross-endpoint` | SEC-001 | Negative | P0 | Pending | QE Security | Sprint-2 |
| Security (OWASP) | `Cross-endpoint` | SEC-002 | Negative | P0 | Partially Automated | QE Security | Sprint-1 |
| Security (OWASP) | `Cross-endpoint` | SEC-003 | Negative | P1 | Pending | QE Security | Sprint-2 |
| Security (OWASP) | `Cross-endpoint` | SEC-004 | Edge | P1 | Pending | QE Security | Sprint-3 |
| Security (OWASP) | `Cross-endpoint` | SEC-005 | Negative | P1 | Pending | QE Security | Sprint-3 |
| Security (OWASP) | `GET /api/reports/*` | SEC-006 | Negative | P0 | Pending | QE Security | Sprint-2 |
| Security (OWASP) | `Cross-endpoint` | SEC-007 | Negative | P2 | Pending | QE Security | Sprint-3 |
| Security (OWASP) | `Cross-endpoint` | SEC-008 | Edge | P2 | Pending | QE Security | Sprint-3 |
| RBAC | `Admin-only endpoints` | RBAC-001 | Positive | P1 | Pending | QE Security | Sprint-2 |
| RBAC | `/reports/api_scan_details` | RBAC-002 | Negative | P0 | Partially Automated | QE Security | Sprint-1 |
| RBAC | `Cross-endpoint` | RBAC-003 | Negative | P0 | Pending | QE Security | Sprint-2 |
| Contract Testing | `POST /api/users/sign_in` | CON-001 | Positive | P0 | Automated | QE Contract Team | Sprint-0 |
| Contract Testing | `GET /api/reports/get_locations` | CON-002 | Positive | P1 | Pending | QE Contract Team | Sprint-1 |
| Contract Testing | `GET /api/reports/get_device_count` | CON-003 | Negative | P1 | Pending | QE Contract Team | Sprint-1 |
| Performance | `POST /api/users/sign_in`, `GET /api/reports/get_locations` | PERF-001 | Positive | P1 | Automated (script ready) | QE Perf Team | Sprint-1 |
| Performance | `GET /api/reports/*` | PERF-002 | Edge | P1 | Pending | QE Perf Team | Sprint-2 |
| Performance | `GET /api/reports/alerts`, `GET /api/reports/vapt_counts` | PERF-003 | Edge | P2 | Pending | QE Perf Team | Sprint-3 |
| Performance | `GET /api/reports/*` | PERF-004 | Edge | P2 | Pending | QE Perf Team | Sprint-3 |
| Resilience | `Cross-endpoint` | RES-001 | Edge | P1 | Pending | QE API Team | Sprint-2 |
| Resilience | `Cross-endpoint` | RES-002 | Edge | P1 | Pending | QE API Team | Sprint-2 |
| Resilience | `Mutating endpoints` | RES-003 | Edge | P2 | Pending | QE API Team | Sprint-3 |
| Data Validation | `Critical response schemas` | DATA-001 | Positive | P1 | Partially Automated | QE API Team | Sprint-1 |
| Data Validation | `List/filter endpoints` | DATA-002 | Edge | P2 | Pending | QE API Team | Sprint-3 |
| Data Validation | `Versioned contracts` | DATA-003 | Edge | P1 | Pending | QE Contract Team | Sprint-2 |

## Notes
- Current framework automated suites map to: `AUTH-001`, `AUTH-002`, `RPT-001`, `RPT-003`, `RPT-009`, `APIKEY-002`, `CON-001`, and `PERF-001` (script present).
- `Partially Automated` means baseline coverage exists but full scenario depth is not yet complete.
- Sprint labels are planning placeholders and can be adjusted to your release calendar.
