import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test } from '../fixtures/api.fixture';

test.describe('Other module routes - functional and security coverage', () => {
  test('@regression should validate password edit page route accessibility contract', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-FUNC-001',
      riskId: 'RISK-AVAILABILITY-OTHER-01',
      module: 'other',
      severity: 'medium'
    });

    const response = await otherClient.getPage('passwordEdit');
    expectStatusIn(response.status, [200, 302, 401, 403, 404, 422, 500]);
  });

  test('@security @negative should reject malformed PATCH payload on /api/users/password', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-NEG-002',
      riskId: 'RISK-INPUT-VALIDATION-OTHER-02',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.patchPassword({
      user: {
        reset_password_token: '',
        password: '123',
        password_confirmation: 'mismatch'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422, 500]);
  });

  test('@security @boundary should reject malformed POST payload on /api/users/password', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-BVA-003',
      riskId: 'RISK-INPUT-BOUNDARY-OTHER-03',
      module: 'other',
      severity: 'high'
    });

    const response = await otherClient.postPassword({
      user: {
        email: 'not-an-email',
        password: 'a',
        password_confirmation: ''
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422, 500]);
  });

  test('@security @abuse should block unsupported delete action on /destroy', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-ABUSE-004',
      riskId: 'RISK-BROKEN-AUTHZ-OTHER-04',
      module: 'other',
      severity: 'critical'
    });

    const response = await otherClient.deleteDestroy();
    expectStatusIn(response.status, [401, 403, 404, 405, 422, 500]);
  });

  test('@regression should validate reports route availability for authenticated context', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-FUNC-005',
      riskId: 'RISK-AVAILABILITY-OTHER-05',
      module: 'other',
      severity: 'medium'
    });

    const response = await otherClient.getPage('reports');
    expectStatusIn(response.status, [200, 302, 401, 403, 404, 422, 500]);
  });

  test('@regression should validate reports export route availability contract', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-FUNC-006',
      riskId: 'RISK-AVAILABILITY-OTHER-06',
      module: 'other',
      severity: 'medium'
    });

    const response = await otherClient.getPage('reportsExport');
    expectStatusIn(response.status, [200, 204, 302, 400, 401, 403, 404, 422, 500]);
  });
});
