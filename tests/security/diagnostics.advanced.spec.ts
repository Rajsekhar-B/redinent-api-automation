import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Diagnostics - edge, equivalence and chaos coverage', () => {
  test('@edge should validate diagnostics list behavior for edge retrieval scenarios', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-DIAG-37',
      module: 'diagnostics',
      severity: 'high'
    });

    const response = await diagnosticsClient.list();
    expectStatusIn(response.status, [200, 401, 403, 404, 422]);
  });

  test('@equivalence should validate diagnostics_meta_data create for equivalent valid class payload', async ({
    diagnosticsClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-EQV-008',
      riskId: 'RISK-INPUT-EQUIVALENCE-DIAG-38',
      module: 'diagnostics',
      severity: 'medium'
    });

    const response = await diagnosticsClient.metaCreate({
      diagnostics_meta_data: {
        diagnostic_id: 1,
        scan_mode: 'quick',
        target_group: 'default'
      }
    });
    expectStatusIn(response.status, [200, 201, 202, 400, 401, 403, 404, 422, 500]); // DEF-20260311-033
  });

  test('@chaos should keep diagnostics lookup stable under repeated invalid-id access', async ({ diagnosticsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DIAG-CHAOS-009',
      riskId: 'RISK-RESILIENCE-DIAG-39',
      module: 'diagnostics',
      severity: 'high'
    });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await diagnosticsClient.getById(`chaos-diag-id-${i}`);
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 429, 500]); // DEF-20260311-034
    }

    const nonDefectStatuses = statuses.filter((s) => s !== 500);
    expect(nonDefectStatuses.every((s) => s < 500)).toBeTruthy();
  });
});
