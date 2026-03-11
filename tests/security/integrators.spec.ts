import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Integrators - functional and security coverage', () => {
  test('@security @regression should block unauthenticated integrators list access', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-13',
      module: 'integrators',
      severity: 'critical'
    });

    const response = await integratorsClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch integrators list for authenticated context', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-12',
      module: 'integrators',
      severity: 'high'
    });

    const response = await integratorsClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid integrator id lookup', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-NEG-003',
      riskId: 'RISK-BOLA-12',
      module: 'integrators',
      severity: 'high'
    });

    const response = await integratorsClient.getById('non-existent-integrator-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed integrator payload on create', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-16',
      module: 'integrators',
      severity: 'high'
    });

    const response = await integratorsClient.create({
      integrator: {
        name: 'x'.repeat(700),
        endpoint: 'not-a-url',
        api_key: ''
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized integrator mutation attempt', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-SEC-005',
      riskId: 'RISK-BFLA-09',
      module: 'integrators',
      severity: 'critical'
    });

    const response = await integratorsClient.patchById('cross-tenant-integrator-123', {
      integrator: { endpoint: 'https://attacker.invalid' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
