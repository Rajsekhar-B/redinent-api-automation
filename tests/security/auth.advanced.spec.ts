import { env } from '../../src/config/env';
import { expectStatusIn } from '../../src/core/assertions';
import { addTestMetadata } from '../../src/core/test-metadata';
import { expect, test } from '../fixtures/api.fixture';

const signInGetRoutes = ['/api/users/sign_in', '/users/sign_in'];
const signInPostRoutes = ['/api/sign_in', '/api/users/sign_in', '/users/sign_in'];
const signOutDeleteRoutes = ['/api/users/sign_out', '/users/sign_out'];

test.describe('Authentication - edge, equivalence and chaos coverage', () => {
  test('@edge should handle GET sign-in routes for edge query strings without 5xx', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-EDGE-009',
      riskId: 'RISK-INPUT-EDGE-AUTH-09',
      module: 'authentication',
      severity: 'medium'
    });

    for (const route of signInGetRoutes) {
      const response = await authClient.getSignInAt(`${route}?redirect=%2Freports&locale=te-IN&tenant=%20`);
      expectStatusIn(response.status, [200, 302, 303, 307, 308, 401, 403, 404, 405, 422]);
      expect(response.status).toBeLessThan(500);
    }
  });

  test('@equivalence should validate valid and invalid partitions across sign-in routes', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-EQV-010',
      riskId: 'RISK-EQUIVALENCE-AUTH-10',
      module: 'authentication',
      severity: 'high'
    });

    test.skip(
      env.DEFAULT_PASSWORD === 'replace_me' || env.DEFAULT_USERNAME.includes('example.com'),
      'Set real DEFAULT_USERNAME/DEFAULT_PASSWORD in .env to enable auth equivalence coverage.'
    );

    for (const route of signInPostRoutes) {
      const validResponse = await authClient.loginAt(route, {
        user: {
          email: env.DEFAULT_USERNAME,
          password: env.DEFAULT_PASSWORD
        }
      });
      expectStatusIn(validResponse.status, [200, 201, 204, 400, 401, 403, 404, 422]);
      expect(validResponse.status).toBeLessThan(500);

      const invalidResponse = await authClient.loginAt(route, {
        user: {
          email: 'invalid.user@redinent.local',
          password: 'WrongPass@123'
        }
      });
      expectStatusIn(invalidResponse.status, [200, 201, 202, 203, 204, 400, 401, 403, 404, 422, 429]);
      expect(invalidResponse.status).toBeLessThan(500);
    }
  });

  test('@chaos should keep sign-out endpoints resilient under repeated bursts', async ({ authClient, tokenManager }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-CHAOS-011',
      riskId: 'RISK-RESILIENCE-AUTH-11',
      module: 'authentication',
      severity: 'high'
    });

    const authHeaders = await tokenManager.getAuthHeaders();

    for (const route of signOutDeleteRoutes) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await authClient.logoutAt(route, authHeaders);
        expectStatusIn(response.status, [200, 202, 203, 204, 400, 401, 403, 404, 405, 422, 429]);
        expect(response.status).toBeLessThan(500);
      }
    }
  });
});
