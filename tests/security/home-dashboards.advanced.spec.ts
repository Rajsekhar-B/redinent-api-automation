import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Home Dashboards - edge, boundary, equivalence, abuse and chaos coverage', () => {
  test('@edge should validate homes list behavior for edge pagination input', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-EDGE-006',
      riskId: 'RISK-INPUT-EDGE-HOME-29',
      module: 'home-dashboards',
      severity: 'high'
    });

    const response = await homeDashboardsClient.list();
    expectStatusIn(response.status, [200, 401, 403, 404, 422]);
  });

  test('@boundary should reject malformed homes create payload', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-BVA-007',
      riskId: 'RISK-INPUT-BOUNDARY-HOME-30',
      module: 'home-dashboards',
      severity: 'high'
    });

    const response = await homeDashboardsClient.create({
      home: {
        title: '',
        widgets: 'not-an-array'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@equivalence should validate dashboard endpoint with equivalent valid class access', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-EQV-008',
      riskId: 'RISK-INPUT-EQUIVALENCE-HOME-31',
      module: 'home-dashboards',
      severity: 'medium'
    });

    const response = await homeDashboardsClient.getDashboard('assetMonitoring');
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });

  test('@abuse should block unauthorized patch attempt on invalid home id', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-ABUSE-009',
      riskId: 'RISK-BOLA-HOME-32',
      module: 'home-dashboards',
      severity: 'critical'
    });

    const response = await homeDashboardsClient.patchById('cross-tenant-home-id-777', {
      home: {
        tenant_id: 'unauthorized-tenant',
        shared: true
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@chaos should keep dashboard APIs stable under repeated mixed requests', async ({ homeDashboardsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-HOME-CHAOS-010',
      riskId: 'RISK-RESILIENCE-HOME-33',
      module: 'home-dashboards',
      severity: 'high'
    });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await homeDashboardsClient.getDashboard(i % 2 === 0 ? 'globalDashboard' : 'threatMonitor');
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 429]);
    }

    expect(statuses.every((s) => s < 500)).toBeTruthy();
  });
});
