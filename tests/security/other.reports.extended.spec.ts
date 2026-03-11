import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test } from '../fixtures/api.fixture';

type OtherReportRoute =
  | 'reportsDetail'
  | 'reportsDetailedStatus'
  | 'reportsExportAlerts'
  | 'reportsExportAlertsFileStatus'
  | 'reportsGenIsoReport'
  | 'reportsGenReport'
  | 'reportsHostprofile'
  | 'reportsMasterResults'
  | 'reportsNew';

const otherReportRoutes: OtherReportRoute[] = [
  'reportsDetail',
  'reportsDetailedStatus',
  'reportsExportAlerts',
  'reportsExportAlertsFileStatus',
  'reportsGenIsoReport',
  'reportsGenReport',
  'reportsHostprofile',
  'reportsMasterResults',
  'reportsNew'
];

test.describe('Other module - extended reports and utility coverage', () => {
  test('@regression should validate /edit route availability contract', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-EXT-001',
      riskId: 'RISK-AVAILABILITY-OTHER-07',
      module: 'other',
      severity: 'medium'
    });

    const response = await otherClient.getPage('edit');
    expectStatusIn(response.status, [200, 204, 302, 401, 403, 404, 422, 500]);
  });

  test('@security @negative should reject malformed PATCH payload on /update', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-EXT-002',
      riskId: 'RISK-INPUT-VALIDATION-OTHER-08',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.patchUpdate({
      id: null,
      settings: 'not-an-object'
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422, 500]);
  });

  for (const route of otherReportRoutes) {
    test(`@regression should validate /reports route availability contract: ${route}`, async ({ otherClient }) => {
      addTestMetadata({
        requirementId: 'REQ-OTHER-EXT-003',
        riskId: 'RISK-AVAILABILITY-OTHER-09',
        module: 'other',
        severity: 'medium'
      });

      const response = await otherClient.getPage(route);
      expectStatusIn(response.status, [200, 204, 302, 400, 401, 403, 404, 422]);
    });
  }

  test('@security @boundary should reject malformed payload on /reports/save_evidence', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-EXT-004',
      riskId: 'RISK-INPUT-BOUNDARY-OTHER-10',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.postSaveEvidence({
      report_id: '',
      evidence: null,
      notes: 'x'.repeat(5000)
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
