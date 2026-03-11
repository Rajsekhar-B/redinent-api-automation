import { addTestMetadata } from '../../src/core/test-metadata';
import { env } from '../../src/config/env';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Auth APIs', () => {
  test('@smoke @sanity should login with valid credentials to Redinent API', async ({ authClient }) => {
    test.skip(
      env.DEFAULT_PASSWORD === 'replace_me' || env.DEFAULT_USERNAME.includes('example.com'),
      'Set real DEFAULT_USERNAME/DEFAULT_PASSWORD in .env to enable auth smoke.'
    );

    addTestMetadata({
      requirementId: 'REQ-AUTH-RED-001',
      riskId: 'RISK-BROKEN-AUTH-01',
      module: 'authentication',
      severity: 'critical'
    });

    const response = await authClient.login({
      user: {
        email: env.DEFAULT_USERNAME,
        password: env.DEFAULT_PASSWORD
      }
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        response: expect.objectContaining({
          email: expect.any(String)
        })
      })
    );
  });
});
