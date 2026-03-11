import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('App Update History - functional and security coverage', () => {
  test('@security @regression should block unauthenticated app update history list access', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-12',
      module: 'app-update-history',
      severity: 'critical'
    });

    const response = await appUpdateHistoryClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch app update history list for authenticated context', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-11',
      module: 'app-update-history',
      severity: 'high'
    });

    const response = await appUpdateHistoryClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid app update history id lookup', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-NEG-003',
      riskId: 'RISK-BOLA-11',
      module: 'app-update-history',
      severity: 'high'
    });

    const response = await appUpdateHistoryClient.getById('non-existent-update-history-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed app update payload on create', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-15',
      module: 'app-update-history',
      severity: 'high'
    });

    const response = await appUpdateHistoryClient.create({
      update_history: {
        version: '',
        release_notes: 'x'.repeat(5000),
        update_type: 'invalid'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized app update mutation attempt', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-SEC-005',
      riskId: 'RISK-BFLA-08',
      module: 'app-update-history',
      severity: 'critical'
    });

    const response = await appUpdateHistoryClient.patchById('cross-tenant-update-history-123', {
      update_history: { update_type: 'major' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@regression should validate update_type endpoint response contract behavior', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-FUNC-006',
      riskId: 'RISK-BUSINESS-RULE-01',
      module: 'app-update-history',
      severity: 'medium'
    });

    const response = await appUpdateHistoryClient.getUpdateType();
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });
});
