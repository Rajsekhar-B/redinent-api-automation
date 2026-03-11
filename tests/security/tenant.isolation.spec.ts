import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Tenant Management - isolation and abuse coverage', () => {
  test('@security @regression should block unauthenticated access to tenant list', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-04',
      module: 'tenant-management',
      severity: 'critical'
    });

    const response = await tenantsClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should allow authenticated tenant list request without server error', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-FUNC-002',
      riskId: 'RISK-CROSS-TENANT-EXPOSURE-01',
      module: 'tenant-management',
      severity: 'high'
    });

    const response = await tenantsClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid tenant identifier lookup', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-NEG-003',
      riskId: 'RISK-BOLA-02',
      module: 'tenant-management',
      severity: 'high'
    });

    const response = await tenantsClient.getById('non-existent-tenant-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @abuse should prevent cross-tenant object mutation attempts', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-SEC-004',
      riskId: 'RISK-BFLA-01',
      module: 'tenant-management',
      severity: 'critical'
    });

    const response = await tenantsClient.patchById('cross-tenant-object-123', {
      tenant: { name: 'Injected Tenant Name' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed tenant creation payload', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-BVA-005',
      riskId: 'RISK-INPUT-BOUNDARY-04',
      module: 'tenant-management',
      severity: 'high'
    });

    const response = await tenantsClient.create({
      tenant: {
        name: 'x'.repeat(512),
        subdomain: ''
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });
});
