# Redinent API Test Strategy

## Scope and quality objectives
- Protect high-risk IoT cybersecurity workflows first.
- Ensure release gating for smoke, regression, and contract compatibility.
- Maintain auditability with tagged tests and metadata annotations.

## Test levels
- Smoke: critical auth, health, and key CRUD read flow.
- Sanity: changed-module focused checks after incremental deployments.
- Regression: full module coverage by risk and requirement mapping.
- Integration: API-to-service dependency checks (jobs, reports, feeds).
- Contract: Pact consumer-provider compatibility.
- End-to-end API workflows: login -> onboarding -> scan -> findings -> report.

## Design dimensions
- Negative and boundary testing for malformed payloads, missing fields, and limits.
- OWASP API Top 10 checks: BOLA, BFLA, broken auth, injection, excessive data exposure, rate limiting.
- Performance profiles: load, soak, spike, baseline trend.
- Resilience: retry, timeout, transient upstream failure behavior.
- Idempotency: repeated POST/PUT on same key and dedupe enforcement.
- Pagination/sorting/filtering correctness and deterministic ordering.
- Schema validation with Zod for key response contracts.
- Backward compatibility checks for versioned endpoints.
- Multi-tenant isolation with tenant-aware headers and data ownership checks.
- Audit logging validations where API exposes event records.

## Exit criteria
- PR gate: lint + type-check + smoke pass.
- Main/nightly: regression and contract pass.
- Critical defects closed or accepted by risk waiver process.
