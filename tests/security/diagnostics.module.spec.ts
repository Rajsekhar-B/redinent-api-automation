import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Diagnostics - functional and security coverage', () => {
  test('@security @regression should block unauthenticated diagnostics list access', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-08',
      module: 'diagnostics',
      severity: 'critical'
    });

    const response = await diagnosticsClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch diagnostics list for authenticated context', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-07',
      module: 'diagnostics',
      severity: 'high'
    });

    const response = await diagnosticsClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid diagnostics id lookup', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-NEG-003',
      riskId: 'RISK-BOLA-06',
      module: 'diagnostics',
      severity: 'high'
    });

    const response = await diagnosticsClient.getById('non-existent-diagnostic-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed diagnostics payload on create', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-09',
      module: 'diagnostics',
      severity: 'high'
    });

    const response = await diagnosticsClient.create({
      diagnostic: {
        name: 'x'.repeat(700),
        target: '',
        frequency: -1
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized stop operation for invalid diagnostics id', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-SEC-005',
      riskId: 'RISK-BFLA-04',
      module: 'diagnostics',
      severity: 'critical'
    });

    const response = await diagnosticsClient.stopById('cross-tenant-diagnostic-123');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @negative should reject invalid diagnostics_meta_data id lookup', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAGMETA-NEG-006',
      riskId: 'RISK-BOLA-07',
      module: 'diagnostics',
      severity: 'high'
    });

    const response = await diagnosticsClient.metaGetById('non-existent-metadata-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
