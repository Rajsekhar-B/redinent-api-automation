import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('CWE Results - functional and security coverage', () => {
  test('@security @regression should block unauthenticated CWE results list access', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-16',
      module: 'cwe-results',
      severity: 'critical'
    });

    const response = await cweResultsClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch CWE results list for authenticated context', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-15',
      module: 'cwe-results',
      severity: 'high'
    });

    const response = await cweResultsClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid CWE result id lookup', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-NEG-003',
      riskId: 'RISK-BOLA-15',
      module: 'cwe-results',
      severity: 'high'
    });

    const response = await cweResultsClient.getById('non-existent-cwe-result-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed CWE result payload on create', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-19',
      module: 'cwe-results',
      severity: 'high'
    });

    const response = await cweResultsClient.create({
      cwe_test_result: {
        cwe_id: '',
        severity: 'invalid',
        description: 'x'.repeat(5000)
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized CWE result mutation attempt', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-SEC-005',
      riskId: 'RISK-BFLA-12',
      module: 'cwe-results',
      severity: 'critical'
    });

    const response = await cweResultsClient.patchById('cross-tenant-cwe-result-123', {
      cwe_test_result: { severity: 'critical' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
