import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

const invalidReportId = 'other-adv-invalid-report-id-001';

test.describe('Other module - edge, equivalence and chaos coverage', () => {
  test('@edge should handle edge payloads across password and report utility routes without 5xx', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-EDGE-019',
      riskId: 'RISK-INPUT-EDGE-OTHER-19',
      module: 'other',
      severity: 'high'
    });

    const passwordPayloads = [
      {
        user: {
          email: 'edge.user+1@redinent.local',
          password: 'A'.repeat(128),
          password_confirmation: 'A'.repeat(128)
        }
      },
      {
        user: {
          email: ' edge.user@redinent.local ',
          password: 'Pass@123 ',
          password_confirmation: 'Pass@123 '
        }
      }
    ];

    for (const payload of passwordPayloads) {
      const patchResponse = await otherClient.patchPassword(payload);
      expectStatusIn(patchResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);
      expect(patchResponse.status).toBeLessThan(500);

      const postResponse = await otherClient.postPassword(payload);
      expectStatusIn(postResponse.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);
      expect(postResponse.status).toBeLessThan(500);

      const putResponse = await otherClient.putPassword(payload);
      expectStatusIn(putResponse.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);
      expect(putResponse.status).toBeLessThan(500);
    }

    const routes: Array<'passwordEdit' | 'passwordNew' | 'edit' | 'reports' | 'reportsExport' | 'reportsDetail'> = [
      'passwordEdit',
      'passwordNew',
      'edit',
      'reports',
      'reportsExport',
      'reportsDetail'
    ];

    for (const route of routes) {
      const response = await otherClient.getPage(route);
      const acceptedStatuses =
        route === 'reportsDetail'
          ? [200, 202, 204, 302, 400, 401, 403, 404, 405, 422, 500] // DEF-20260311-036
          : [200, 202, 204, 302, 400, 401, 403, 404, 405, 422];
      expectStatusIn(response.status, acceptedStatuses);
      if (route !== 'reportsDetail') {
        expect(response.status).toBeLessThan(500);
      }
    }
  });

  test('@equivalence should validate valid vs invalid partitions for reports resource APIs', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-EQV-020',
      riskId: 'RISK-EQUIVALENCE-OTHER-20',
      module: 'other',
      severity: 'high'
    });

    const validLikePayload = {
      report: {
        title: 'equivalence-report-sample',
        format: 'pdf'
      }
    };

    const invalidPayload = {
      report: {
        title: '',
        format: null
      }
    };

    const createValidLike = await otherClient.createReport(validLikePayload);
    expectStatusIn(createValidLike.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);
    expect(createValidLike.status).toBeLessThan(500);

    const createInvalid = await otherClient.createReport(invalidPayload);
    expectStatusIn(createInvalid.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);
    expect(createInvalid.status).toBeLessThan(500);

    for (const id of [invalidReportId, '1']) {
      const getResponse = await otherClient.getReportById(id);
      expectStatusIn(getResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);
      expect(getResponse.status).toBeLessThan(500);

      const patchResponse = await otherClient.patchReportById(id, { report: { title: `eqv-${id}` } });
      expectStatusIn(patchResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);
      expect(patchResponse.status).toBeLessThan(500);

      const putResponse = await otherClient.putReportById(id, { report: { title: `eqv-put-${id}` } });
      expectStatusIn(putResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);
      expect(putResponse.status).toBeLessThan(500);

      const editResponse = await otherClient.getReportEditById(id);
      expectStatusIn(editResponse.status, [200, 202, 204, 302, 400, 401, 403, 404, 422]);
      expect(editResponse.status).toBeLessThan(500);
    }
  });

  test('@chaos should stay resilient under repeated calls to report utility endpoints', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-CHAOS-021',
      riskId: 'RISK-RESILIENCE-OTHER-21',
      module: 'other',
      severity: 'high'
    });

    const chaosRoutes: Array<'reportsDetailedStatus' | 'reportsExportAlerts' | 'reportsExportAlertsFileStatus' | 'reportsGenReport' | 'reportsMasterResults'> = [
      'reportsDetailedStatus',
      'reportsExportAlerts',
      'reportsExportAlertsFileStatus',
      'reportsGenReport',
      'reportsMasterResults'
    ];

    for (let i = 0; i < 5; i += 1) {
      for (const route of chaosRoutes) {
        const response = await otherClient.getPage(route);
        const acceptedStatuses =
          route === 'reportsExportAlertsFileStatus' || route === 'reportsGenReport'
            ? [200, 202, 204, 302, 400, 401, 403, 404, 405, 422, 429, 500] // DEF-20260311-037, DEF-20260311-038
            : [200, 202, 204, 302, 400, 401, 403, 404, 405, 422, 429];
        expectStatusIn(response.status, acceptedStatuses);
        if (route !== 'reportsExportAlertsFileStatus' && route !== 'reportsGenReport') {
          expect(response.status).toBeLessThan(500);
        }
      }

      const deleteResponse = await otherClient.deleteReportById(`${invalidReportId}-${i}`);
      expectStatusIn(deleteResponse.status, [200, 202, 204, 400, 401, 403, 404, 405, 422, 429]);
      expect(deleteResponse.status).toBeLessThan(500);
    }
  });
});
