# Redinent-Specific API Risk Model

## High-priority scenarios
- Device onboarding: duplicate deviceId handling and tenant ownership.
- Vulnerability ingestion/enrichment: CVE mapping integrity and stale-feed fallback.
- Threat intelligence feeds: schema drift and feed authentication failures.
- Scan scheduling/execution: async job creation, status polling, timeout handling.
- Findings severity mapping: deterministic severity and confidence assignment.
- Duplicate asset handling: idempotent create semantics and conflict errors.
- Cross-tenant leakage prevention: tenant A cannot access tenant B resources.
- Privilege escalation prevention: viewer cannot trigger scan/report write actions.
- BOLA and broken auth checks across ID-based endpoints.
- Excessive data exposure: sensitive fields not returned to low-privilege roles.
- Search/filter on large datasets: accuracy and performance thresholds.
- Report generation workflow: initiation, polling, download authorization.
- Eventual consistency: delayed indexing handled via polling patterns.
- Webhook callbacks: signature verification and replay attack rejection.
