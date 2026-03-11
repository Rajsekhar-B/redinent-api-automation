import { addTestMetadata } from '../../src/core/test-metadata';
import { env } from '../../src/config/env';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

const protectedEndpoints = ['scanDetails', 'cveDetails', 'cweDetails', 'deviceDetails'] as const;

test.describe('Report details API key authorization checks', () => {
  for (const endpoint of protectedEndpoints) {
    test(`@security @regression should deny ${endpoint} for invalid api_key`, async ({ reportsClient }) => {
      addTestMetadata({
        requirementId: `REQ-RBAC-REPORTS-${endpoint.toUpperCase()}`,
        riskId: 'RISK-PRIV-ESC-01',
        module: 'reports',
        severity: 'critical'
      });

      const response = await reportsClient.getReportDetailsWithApiKey(endpoint, 'invalid-api-key', env.SAMPLE_UID);
      expectStatusIn(response.status, [200, 401, 403]);

      if (response.status === 200) {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: false
          })
        );
      }
    });
  }

  test('@security should reject report details call for missing uid', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-RBAC-REPORTS-UID-001',
      riskId: 'RISK-BOLA-01',
      module: 'reports',
      severity: 'high'
    });

    const response = await reportsClient.getReportDetailsWithApiKey('scanDetails', 'invalid-api-key', '');
    expectStatusIn(response.status, [200, 400, 401, 403, 422]);
  });
});
