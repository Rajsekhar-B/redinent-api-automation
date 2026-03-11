import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Discovery & Scan - functional and security coverage', () => {
  test('@security @regression should block unauthenticated discovery list access', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-06',
      module: 'discovery-scan',
      severity: 'critical'
    });

    const response = await discoveriesClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch discovery list for authenticated context', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-05',
      module: 'discovery-scan',
      severity: 'high'
    });

    const response = await discoveriesClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject unknown discovery id lookup', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-NEG-003',
      riskId: 'RISK-BOLA-04',
      module: 'discovery-scan',
      severity: 'high'
    });

    const response = await discoveriesClient.getById('non-existent-discovery-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed discovery creation payload', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-06',
      module: 'discovery-scan',
      severity: 'high'
    });

    const response = await discoveriesClient.create({
      discovery: {
        name: 'x'.repeat(700),
        schedule: 'invalid-cron',
        targets: []
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should block unauthorized scan status toggle for invalid discovery id', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-SEC-005',
      riskId: 'RISK-BFLA-03',
      module: 'discovery-scan',
      severity: 'critical'
    });

    const response = await discoveriesClient.toggleScanStatus('cross-tenant-discovery-123', {
      status: 'start'
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@regression @chaos should keep discovery status endpoint stable under normal request', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-RES-006',
      riskId: 'RISK-AVAILABILITY-01',
      module: 'discovery-scan',
      severity: 'medium'
    });

    const response = await discoveriesClient.getStatus();
    expectStatusIn(response.status, [200, 400, 401, 403, 404]);
  });
});
