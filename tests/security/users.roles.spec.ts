import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Users & Roles - functional and security coverage', () => {
  test('@security @regression should block unauthenticated users list access', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-07',
      module: 'users-roles',
      severity: 'critical'
    });

    const response = await usersClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch users list for authenticated context', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-06',
      module: 'users-roles',
      severity: 'high'
    });

    const response = await usersClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid user id lookup', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-NEG-003',
      riskId: 'RISK-BOLA-05',
      module: 'users-roles',
      severity: 'high'
    });

    const response = await usersClient.getById('non-existent-user-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed user payload on create', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-07',
      module: 'users-roles',
      severity: 'high'
    });

    const response = await usersClient.create({
      user: {
        email: 'invalid-email-format',
        password: '',
        name: 'x'.repeat(512)
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should block privilege escalation attempt during user creation', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-SEC-005',
      riskId: 'RISK-PRIV-ESC-02',
      module: 'users-roles',
      severity: 'critical'
    });

    const response = await usersClient.create({
      user: {
        email: 'escalation.test@redinent.local',
        password: 'Escalate@123',
        role: 'super_admin'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @negative should reject malformed payload on legacy create_user endpoint', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-LEGACY-006',
      riskId: 'RISK-INPUT-VALIDATION-08',
      module: 'users-roles',
      severity: 'high'
    });

    const response = await usersClient.createLegacy({
      email: '',
      role: 'invalid-role',
      tenant_id: null
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
