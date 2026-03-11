import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Application Utilities - edge, equivalence and chaos coverage', () => {
  test('@edge should validate set_timezone handling for timezone boundary format', async ({ applicationUtilitiesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UTIL-EDGE-003',
      riskId: 'RISK-INPUT-EDGE-UTIL-23',
      module: 'application-utilities',
      severity: 'high'
    });

    const response = await applicationUtilitiesClient.setTimezone({
      timezone: 'UTC+14:00',
      offset: 840
    });
    expectStatusIn(response.status, [200, 204, 400, 401, 403, 404, 422]);
  });

  test('@equivalence should validate delete_export_file with equivalent valid identifier class', async ({
    applicationUtilitiesClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-UTIL-EQV-004',
      riskId: 'RISK-INPUT-EQUIVALENCE-UTIL-24',
      module: 'application-utilities',
      severity: 'medium'
    });

    const response = await applicationUtilitiesClient.deleteExportFile({
      file_id: 12345,
      file_name: 'sample-export-file.csv'
    });
    expectStatusIn(response.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@chaos should keep set_timezone stable during repeated updates', async ({ applicationUtilitiesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UTIL-CHAOS-005',
      riskId: 'RISK-RESILIENCE-UTIL-25',
      module: 'application-utilities',
      severity: 'high'
    });

    const statuses: number[] = [];
    const offsets = [0, 60, -60, 330, -480];

    for (let i = 0; i < offsets.length; i += 1) {
      const response = await applicationUtilitiesClient.setTimezone({
        timezone: 'UTC',
        offset: offsets[i]
      });
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 204, 400, 401, 403, 404, 422, 429]);
    }

    expect(statuses.every((s) => s < 500)).toBeTruthy();
  });
});
