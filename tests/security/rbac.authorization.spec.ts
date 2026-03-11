import { addTestMetadata } from '../../src/core/test-metadata';
import { env } from '../../src/config/env';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Authorization guard checks', () => {
  test('@security @regression should deny /reports/api_scan_details for invalid api_key', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-RBAC-REPORTS-007',
      riskId: 'RISK-PRIV-ESC-01',
      module: 'reports',
      severity: 'critical'
    });

    const response = await reportsClient.getScanDetailsWithApiKey('invalid-api-key', env.SAMPLE_UID);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        status: 401,
        stats: 'Unauthorized'
      })
    );
  });
});
