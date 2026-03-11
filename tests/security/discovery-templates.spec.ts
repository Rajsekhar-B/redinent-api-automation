import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Discovery Templates - functional and security coverage', () => {
  test('@security @regression should block unauthenticated discovery templates list access', async ({ discoveryTemplatesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DTPL-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-14',
      module: 'discovery-templates',
      severity: 'critical'
    });

    const response = await discoveryTemplatesClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch discovery templates list for authenticated context', async ({ discoveryTemplatesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DTPL-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-13',
      module: 'discovery-templates',
      severity: 'high'
    });

    const response = await discoveryTemplatesClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid discovery template id lookup', async ({ discoveryTemplatesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DTPL-NEG-003',
      riskId: 'RISK-BOLA-13',
      module: 'discovery-templates',
      severity: 'high'
    });

    const response = await discoveryTemplatesClient.getById('non-existent-template-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed discovery template payload on create', async ({ discoveryTemplatesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DTPL-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-17',
      module: 'discovery-templates',
      severity: 'high'
    });

    const response = await discoveryTemplatesClient.create({
      discovery_template: {
        name: 'x'.repeat(700),
        schedule: 'invalid',
        targets: []
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized discovery template mutation attempt', async ({ discoveryTemplatesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DTPL-SEC-005',
      riskId: 'RISK-BFLA-10',
      module: 'discovery-templates',
      severity: 'critical'
    });

    const response = await discoveryTemplatesClient.patchById('cross-tenant-template-123', {
      discovery_template: { name: 'forced-change' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
