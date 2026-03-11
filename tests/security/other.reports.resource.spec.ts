import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test } from '../fixtures/api.fixture';

const invalidReportId = 'non-existent-report-id-99999';

test.describe('Other module - reports resource CRUD and abuse coverage', () => {
  test('@security @negative should reject unauthenticated report creation', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-001',
      riskId: 'RISK-BROKEN-AUTH-OTHER-11',
      module: 'other',
      severity: 'critical'
    });

    const response = await otherClient.createReportWithoutAuth({
      report: {
        name: 'unauthorized-report-create',
        format: 'pdf'
      }
    });
    expectStatusIn(response.status, [401, 403, 302, 404, 422]);
  });

  test('@regression should return a non-5xx contract for invalid report id lookup', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-002',
      riskId: 'RISK-AVAILABILITY-OTHER-12',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.getReportById(invalidReportId);
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @abuse should block cross-tenant patch attempts on /reports/:id', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-003',
      riskId: 'RISK-BOLA-OTHER-13',
      module: 'other',
      severity: 'critical'
    });

    const response = await otherClient.patchReportById(invalidReportId, {
      report: {
        tenant_id: 'cross-tenant-id-evil',
        severity: 'critical'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@regression should enforce non-5xx behavior for malformed PUT /reports/:id payload', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-004',
      riskId: 'RISK-INPUT-VALIDATION-OTHER-14',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.putReportById(invalidReportId, {
      report: {
        title: '',
        widgets: 'invalid-type'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @abuse should block report delete attempts on invalid or unauthorized id', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-005',
      riskId: 'RISK-BFLA-OTHER-15',
      module: 'other',
      severity: 'critical'
    });

    const response = await otherClient.deleteReportById(invalidReportId);
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@regression should validate /reports/:id/edit route contract for invalid id', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-006',
      riskId: 'RISK-AVAILABILITY-OTHER-16',
      module: 'other',
      severity: 'medium'
    });

    const response = await otherClient.getReportEditById(invalidReportId);
    expectStatusIn(response.status, [200, 302, 400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed PUT payload on /api/users/password', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-007',
      riskId: 'RISK-INPUT-BOUNDARY-OTHER-17',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.putPassword({
      user: {
        reset_password_token: null,
        password: 'x',
        password_confirmation: 'y'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@regression should enforce non-5xx contract for malformed reports create payload', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-RSC-008',
      riskId: 'RISK-INPUT-VALIDATION-OTHER-18',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.createReport({
      report: {
        title: '',
        payload: null
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
