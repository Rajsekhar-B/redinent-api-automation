# Redinent API Automation Framework

## What is wired to your real app now
- Sign-in endpoint: `POST /api/users/sign_in`
- API report endpoints:
  - `GET /api/reports/get_locations`
  - `GET /api/reports/get_device_count`
  - `GET /api/reports/get_device_count_all`
  - `GET /api/reports/model_numbers`
  - `GET /api/reports/open_ports`
  - `GET /api/reports/vapt_counts`
  - `GET /api/reports/alerts`
  - `GET /api/reports/vulnerable_hosts`
- API-key protected report details:
  - `GET /reports/api_scan_details`
  - `GET /reports/api_cve_details`
  - `GET /reports/api_cwe_details`
  - `GET /reports/api_device_details`

## Auth model mapped
- Primary login flow uses Devise JSON sign-in payload:
  - `{ "user": { "email": "...", "password": "..." } }`
- Framework stores cookie-based session automatically (Playwright request context).
- If `authentication_token` is present in login response, framework also sends token headers:
  - `X-User-Email`
  - `X-User-Token`

## Current test coverage (starter)
- Smoke: valid API sign-in.
- Regression: report locations endpoint and query-driven report endpoint behavior.
- Negative: missing required query parameters validation.
- Security/RBAC: unauthorized API-key access check on `/reports/api_scan_details`.
- Contract: Pact for `/api/users/sign_in` response contract.
- Performance: k6 smoke profile for sign-in and locations.

## Setup
1. `cp .env.example .env`
2. Fill `.env` with real values:
   - `BASE_URL`
   - `DEFAULT_USERNAME`
   - `DEFAULT_PASSWORD`
   - `CORE_API_KEY` (for API-key tests)
3. Install dependencies:
   - `npm ci`
4. Install Playwright browsers:
   - `npx playwright install`

## Run
- `npm run test:smoke`
- `npm run test:regression`
- `npm run test:security`
- `npm run test:contracts`
- `npm run perf:smoke`

## Reporting
- JUnit XML: `reports/junit/results.xml`
- Allure results: `allure-results`
- Generate Allure HTML:
  - `npm run allure:generate`
  - `npm run allure:open`

## CI/CD notes
- GitHub Actions workflow is included at `.github/workflows/api-tests.yml`.
- Adaptation to Jenkins/Azure DevOps: reuse npm scripts as stages/jobs and publish `allure-results` + `reports/junit/results.xml` as artifacts.

## Assumptions
- API server is the Rails app (`redinent-frontend`) reachable at `BASE_URL`.
- API sign-in returns `response.authentication_token` for token-header auth fallback.
- Some report-detail endpoints encode logical status in JSON (`status: 401`) while returning HTTP 200.
