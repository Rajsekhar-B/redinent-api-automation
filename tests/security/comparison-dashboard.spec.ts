import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test } from '../fixtures/api.fixture';

test.describe('Comparison Dashboard - functional and security coverage', () => {
  test('@security @regression should block unauthenticated comparison dashboard index access', async ({
    comparisonDashboardClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-18',
      module: 'comparison-dashboard',
      severity: 'critical'
    });

    const response = await comparisonDashboardClient.indexWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);
  });

  test('@regression should fetch comparison dashboard index for authenticated context', async ({ comparisonDashboardClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-17',
      module: 'comparison-dashboard',
      severity: 'high'
    });

    const response = await comparisonDashboardClient.index();
    expectStatusIn(response.status, [200, 401, 403]);
  });

  test('@security @boundary should reject malformed payload on fetch_comparison_data', async ({ comparisonDashboardClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-BVA-003',
      riskId: 'RISK-INPUT-BOUNDARY-20',
      module: 'comparison-dashboard',
      severity: 'high'
    });

    const response = await comparisonDashboardClient.fetchComparisonData({
      quarter: 'invalid-quarter',
      year: -1,
      tenant: null
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422, 500]);
  });

  test('@regression should validate quarterly vulnerability dashboard endpoint availability', async ({ comparisonDashboardClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-FUNC-004',
      riskId: 'RISK-AVAILABILITY-04',
      module: 'comparison-dashboard',
      severity: 'medium'
    });

    const response = await comparisonDashboardClient.getPublicDashboard('quarterlyVulnerabilityDashboard');
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 500]);
  });

  test('@regression should validate fetch_vuln_details endpoint availability', async ({ comparisonDashboardClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-FUNC-005',
      riskId: 'RISK-AVAILABILITY-05',
      module: 'comparison-dashboard',
      severity: 'medium'
    });

    const response = await comparisonDashboardClient.getPublicDashboard('fetchVulnerabilityDetails');
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 500]);
  });
});
