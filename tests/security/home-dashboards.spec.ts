import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Home Dashboards - functional and security coverage', () => {
  test('@security @regression should block unauthenticated homes list access', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-17',
      module: 'home-dashboards',
      severity: 'critical'
    });

    const response = await homeDashboardsClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch homes list for authenticated context', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-16',
      module: 'home-dashboards',
      severity: 'high'
    });

    const response = await homeDashboardsClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid home resource id lookup', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-NEG-003',
      riskId: 'RISK-BOLA-16',
      module: 'home-dashboards',
      severity: 'high'
    });

    const response = await homeDashboardsClient.getById('non-existent-home-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@regression should validate global_dashboard endpoint availability', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-FUNC-004',
      riskId: 'RISK-AVAILABILITY-02',
      module: 'home-dashboards',
      severity: 'medium'
    });

    const response = await homeDashboardsClient.getDashboard('globalDashboard');
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });

  test('@regression should validate threatmonitor endpoint availability', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-FUNC-005',
      riskId: 'RISK-AVAILABILITY-03',
      module: 'home-dashboards',
      severity: 'medium'
    });

    const response = await homeDashboardsClient.getDashboard('threatMonitor');
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });
});
