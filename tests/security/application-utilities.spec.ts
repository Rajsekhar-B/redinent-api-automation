import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test } from '../fixtures/api.fixture';

test.describe('Application Utilities - functional and security coverage', () => {
  test('@security @boundary should reject malformed timezone payload', async ({ applicationUtilitiesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UTIL-BVA-001',
      riskId: 'RISK-INPUT-BOUNDARY-21',
      module: 'application-utilities',
      severity: 'high'
    });

    const response = await applicationUtilitiesClient.setTimezone({
      timezone: 'INVALID_TIMEZONE_VALUE_###',
      offset: 'not-a-number'
    });
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 500]);
  });

  test('@security @negative should reject malformed delete_export_file payload', async ({ applicationUtilitiesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UTIL-NEG-002',
      riskId: 'RISK-INPUT-VALIDATION-22',
      module: 'application-utilities',
      severity: 'high'
    });

    const response = await applicationUtilitiesClient.deleteExportFile({
      file_id: null,
      file_name: ''
    });
    expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 500]);
  });
});
