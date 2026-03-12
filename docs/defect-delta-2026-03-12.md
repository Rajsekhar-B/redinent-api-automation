# Full Suite Defect Delta - 2026-03-12

- Full suite executed: `209` tests
- Passed: `181`
- Failed: `28`
- Existing mapped defects: `26`
- New defect(s) added in this run: `1` (`DEF-20260312-053`)
- Intermittent/unconfirmed from full run: `1`

## Failure-to-Defect Delta

| # | Failed Test | Defect Mapping | Delta Type |
|---|---|---|---|
| 1 | regression/other.reports.lifecycle.spec.ts :: @regression @positive should complete report lifecycle create-get-patch-put-delete | DEF-20260310-032 (and aligns with DEF-20260312-052 lifecycle blocker) | Existing |
| 2 | security/app-update-history.spec.ts :: @regression should validate update_type endpoint response contract behavior | DEF-20260310-017 | Existing |
| 3 | security/application-utilities.spec.ts :: @security @boundary should reject malformed timezone payload | DEF-20260310-024 | Existing |
| 4 | security/comparison-dashboard.spec.ts :: @security @boundary should reject malformed payload on fetch_comparison_data | DEF-20260310-023 | Existing |
| 5 | security/cwe-results.spec.ts :: @security @regression should block unauthenticated CWE results list access | DEF-20260312-053 | New (added) |
| 6 | security/cwe-results.spec.ts :: @regression should fetch CWE results list for authenticated context | DEF-20260310-022 | Existing |
| 7 | security/devices.assets.spec.ts :: @security @boundary should reject malformed device registration payload | DEF-20260310-004 | Existing |
| 8 | security/diagnostics.module.spec.ts :: @security @negative should reject invalid diagnostics id lookup | DEF-20260310-012 | Existing |
| 9 | security/diagnostics.module.spec.ts :: @security @boundary should reject malformed diagnostics payload on create | DEF-20260310-013 | Existing |
| 10 | security/diagnostics.module.spec.ts :: @security @abuse should reject unauthorized stop operation for invalid diagnostics id | DEF-20260310-014 | Existing |
| 11 | security/discovery-templates.spec.ts :: @security @negative should reject invalid discovery template id lookup | DEF-20260310-020 | Existing |
| 12 | security/discovery.scan.advanced.spec.ts :: @chaos should keep pending discovery routes stable under repeated execution | No stable repro in isolated rerun | Intermittent / investigate |
| 13 | security/discovery.scan.spec.ts :: @security @boundary should reject malformed discovery creation payload | DEF-20260310-005 | Existing |
| 14 | security/discovery.scan.spec.ts :: @security @abuse should block unauthorized scan status toggle for invalid discovery id | DEF-20260310-006 | Existing |
| 15 | security/discovery.scan.spec.ts :: @regression @chaos should keep discovery status endpoint stable under normal request | DEF-20260310-007 | Existing |
| 16 | security/integrators.spec.ts :: @security @boundary should reject malformed integrator payload on create | DEF-20260310-018 | Existing |
| 17 | security/oem.signatures.spec.ts :: @security @negative should reject malformed payload on create_oem_signature endpoint | DEF-20260310-015 | Existing |
| 18 | security/otp.web.spec.ts :: @security @negative should reject malformed query on verify_otp GET | DEF-20260310-025 | Existing |
| 19 | security/otp.web.spec.ts :: @security @boundary should reject malformed verify_otp POST payload | DEF-20260310-026 | Existing |
| 20 | security/tenant.isolation.spec.ts :: @security @negative should reject invalid tenant identifier lookup | DEF-20260310-001 | Existing |
| 21 | security/tenant.isolation.spec.ts :: @security @abuse should prevent cross-tenant object mutation attempts | DEF-20260310-002 | Existing |
| 22 | security/tenant.isolation.spec.ts :: @security @boundary should reject malformed tenant creation payload | DEF-20260310-003 | Existing |
| 23 | security/uptime.monitoring.spec.ts :: @security @negative should reject malformed payload on add_server_details | DEF-20260310-016 | Existing |
| 24 | security/users.roles.spec.ts :: @security @negative should reject invalid user id lookup | DEF-20260310-008 | Existing |
| 25 | security/users.roles.spec.ts :: @security @boundary should reject malformed user payload on create | DEF-20260310-009 | Existing |
| 26 | security/users.roles.spec.ts :: @security @abuse should block privilege escalation attempt during user creation | DEF-20260310-010 | Existing |
| 27 | security/users.roles.spec.ts :: @security @negative should reject malformed payload on legacy create_user endpoint | DEF-20260310-011 | Existing |
| 28 | security/zip-uploads.spec.ts :: @security @boundary should reject malformed zip upload payload on create | DEF-20260310-021 | Existing |

## Notes

- This delta is based on the full-suite final summary (`28 failed, 181 passed`).
- The `discovery.scan.advanced` chaos failure did not reproduce when executed alone immediately after the full run.
