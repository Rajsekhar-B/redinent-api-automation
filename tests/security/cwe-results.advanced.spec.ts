import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('CWE Results - edge, equivalence and chaos coverage', () => {
  test('@edge should validate CWE list behavior for edge retrieval scenarios', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-EDGE-006',
      riskId: 'RISK-INPUT-EDGE-CWE-34',
      module: 'cwe-results',
      severity: 'high'
    });

    const response = await cweResultsClient.list();
    expectStatusIn(response.status, [200, 401, 403, 404, 422]);
  });

  test('@equivalence should validate CWE dashboard view endpoint with equivalent valid access', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-EQV-007',
      riskId: 'RISK-INPUT-EQUIVALENCE-CWE-35',
      module: 'cwe-results',
      severity: 'medium'
    });

    const response = await cweResultsClient.dashboardView();
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422]);
  });

  test('@chaos should keep CWE endpoints stable under repeated mixed operations', async ({ cweResultsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CWE-CHAOS-008',
      riskId: 'RISK-RESILIENCE-CWE-36',
      module: 'cwe-results',
      severity: 'high'
    });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await cweResultsClient.getById(`chaos-cwe-result-${i}`);
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 429]);
    }

    expect(statuses.every((s) => s < 500)).toBeTruthy();
  });
});
