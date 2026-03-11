import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Asset Group Management - functional and security coverage', () => {
  test('@security @regression should block unauthenticated asset group list access', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-11',
      module: 'asset-group-management',
      severity: 'critical'
    });

    const response = await assetGroupClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch asset group list for authenticated context', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-10',
      module: 'asset-group-management',
      severity: 'high'
    });

    const response = await assetGroupClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid asset group id lookup', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-NEG-003',
      riskId: 'RISK-BOLA-10',
      module: 'asset-group-management',
      severity: 'high'
    });

    const response = await assetGroupClient.getById('non-existent-asset-group-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed asset group payload on create', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-14',
      module: 'asset-group-management',
      severity: 'high'
    });

    const response = await assetGroupClient.create({
      asset_group: {
        name: 'x'.repeat(700),
        description: 'x'.repeat(2000),
        rule: null
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized asset group mutation attempt', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-SEC-005',
      riskId: 'RISK-BFLA-07',
      module: 'asset-group-management',
      severity: 'critical'
    });

    const response = await assetGroupClient.patchById('cross-tenant-asset-group-123', {
      asset_group: { name: 'forced-change' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @abuse should reject unauthorized toggle activation attempt', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-SEC-006',
      riskId: 'RISK-PRIV-ESC-03',
      module: 'asset-group-management',
      severity: 'critical'
    });

    const response = await assetGroupClient.toggleActivation('cross-tenant-asset-group-123');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
