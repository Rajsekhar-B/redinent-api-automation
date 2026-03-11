import { addTestMetadata } from '../../src/core/test-metadata';
import { test, expect } from '../fixtures/api.fixture';

test.describe('API Negative and OWASP-focused checks', () => {
  test('@security should reject missing required query params for get_device_count', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INPUT-NEG-001',
      riskId: 'RISK-API8-MISCONFIG-01',
      module: 'reports',
      severity: 'high'
    });

    const response = await reportsClient.getDeviceCount({
      location: 'sample-location'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining('Missing parameters')
      })
    );
  });

  test('@security should reject invalid credentials for sign_in', async ({ authClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUTH-NEG-002',
      riskId: 'RISK-BROKEN-AUTH-02',
      module: 'authentication',
      severity: 'critical'
    });

    const response = await authClient.login({
      user: {
        email: 'invalid.user@redinent.local',
        password: 'InvalidPass#123'
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.success ?? response.body.status).toBeFalsy();
  });
});
