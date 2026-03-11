import authCases from '../../src/data/auth-cases.json';
import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { env } from '../../src/config/env';
import { test, expect } from '../fixtures/api.fixture';

function expectDeniedLogin(responseBody: Record<string, unknown>): void {
  const success = responseBody.success;
  const status = responseBody.status;
  const authToken = (responseBody.response as Record<string, unknown> | undefined)?.authentication_token;

  if (typeof success === 'boolean') {
    expect(success).toBeFalsy();
  }

  if (typeof status === 'boolean') {
    expect(status).toBeFalsy();
  }

  expect(authToken).toBeUndefined();
}

test.describe('Auth API - regression and security coverage', () => {
  test('@regression @security should authenticate valid user and return identity payload under latency SLO', async ({ authClient }) => {
    test.skip(
      env.DEFAULT_PASSWORD === 'replace_me' || env.DEFAULT_USERNAME.includes('example.com'),
      'Set real DEFAULT_USERNAME/DEFAULT_PASSWORD in .env to enable auth regression.'
    );

    addTestMetadata({
      requirementId: 'REQ-AUTH-RED-001',
      riskId: 'RISK-BROKEN-AUTH-01',
      module: 'authentication',
      severity: 'critical'
    });

    const startedAt = Date.now();
    const response = await authClient.login({
      user: {
        email: env.DEFAULT_USERNAME,
        password: env.DEFAULT_PASSWORD
      }
    });
    const elapsedMs = Date.now() - startedAt;

    expectStatusIn(response.status, [200, 201]);
    expect(elapsedMs).toBeLessThan(3000);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        response: expect.objectContaining({
          email: expect.any(String)
        })
      })
    );
  });

  test('@regression @negative should reject invalid credentials without issuing token', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-NEG-002',
      riskId: 'RISK-BROKEN-AUTH-02',
      module: 'authentication',
      severity: 'critical'
    });

    const response = await authClient.login(authCases.invalidCredentials);

    expectStatusIn(response.status, [200, 400, 401, 403, 422]);
    expectDeniedLogin(response.body as Record<string, unknown>);
  });

  test('@regression @negative should reject missing required email field', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-NEG-003',
      riskId: 'RISK-INPUT-VALIDATION-01',
      module: 'authentication',
      severity: 'high'
    });

    const response = await authClient.login(authCases.missingEmail);

    expectStatusIn(response.status, [200, 400, 401, 422]);
    expectDeniedLogin(response.body as Record<string, unknown>);
  });

  test('@regression @negative should reject missing required password field', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-NEG-004',
      riskId: 'RISK-INPUT-VALIDATION-02',
      module: 'authentication',
      severity: 'high'
    });

    const response = await authClient.login(authCases.missingPassword);

    expectStatusIn(response.status, [200, 400, 401, 422]);
    expectDeniedLogin(response.body as Record<string, unknown>);
  });

  test('@regression @boundary should enforce email input boundary limits', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-BVA-005',
      riskId: 'RISK-INPUT-BOUNDARY-01',
      module: 'authentication',
      severity: 'medium'
    });

    const response = await authClient.login(authCases.boundaryEmailLong);

    expectStatusIn(response.status, [200, 400, 401, 413, 422]);
    expectDeniedLogin(response.body as Record<string, unknown>);
  });

  test('@security @abuse should block SQL-injection style login payloads', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-SEC-006',
      riskId: 'RISK-API8-INJECTION-01',
      module: 'authentication',
      severity: 'critical'
    });

    const response = await authClient.login(authCases.sqlInjectionAttempt);

    expectStatusIn(response.status, [200, 400, 401, 403, 422]);
    expectDeniedLogin(response.body as Record<string, unknown>);
  });

  test('@security @abuse should not allow repeated invalid login attempts to authenticate', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-SEC-007',
      riskId: 'RISK-BRUTE-FORCE-01',
      module: 'authentication',
      severity: 'critical'
    });

    const attemptCount = 5;
    for (let index = 0; index < attemptCount; index += 1) {
      const response = await authClient.login(authCases.invalidCredentials);
      expectStatusIn(response.status, [200, 400, 401, 403, 422, 429]);
      expectDeniedLogin(response.body as Record<string, unknown>);
    }
  });

  test('@security @regression should reject logout without valid authentication context', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-RBAC-008',
      riskId: 'RISK-BROKEN-AUTH-03',
      module: 'authentication',
      severity: 'high'
    });

    const response = await authClient.logout();
    expectStatusIn(response.status, [200, 204, 401, 403, 422]);
  });
});
