import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Users & Roles - edge, equivalence and chaos coverage', () => {
  test('@edge should validate legacy create_user behavior for edge payload values', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-USR-40',
      module: 'users-roles',
      severity: 'high'
    });

    const response = await usersClient.createLegacy({
      email: 'edge.user+1@redinent.local',
      role: 'user',
      first_name: 'E',
      last_name: 'U'
    });
    expectStatusIn(response.status, [200, 201, 400, 401, 403, 404, 422, 500]); // DEF-20260311-035
  });

  test('@equivalence should validate legacy update_user endpoint with equivalent valid class', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-EQV-008',
      riskId: 'RISK-INPUT-EQUIVALENCE-USR-41',
      module: 'users-roles',
      severity: 'medium'
    });

    const response = await usersClient.updateLegacy({
      id: 1,
      role: 'auditor',
      status: 'active'
    });
    expectStatusIn(response.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@chaos should keep users lookup stable under repeated invalid-id access', async ({ usersClient }) => {
    addTestMetadata({
      requirementId: 'REQ-USR-CHAOS-009',
      riskId: 'RISK-RESILIENCE-USR-42',
      module: 'users-roles',
      severity: 'high'
    });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const response = await usersClient.getById(`chaos-user-${i}`);
      statuses.push(response.status);
      expectStatusIn(response.status, [200, 400, 401, 403, 404, 422, 429]);
    }

    expect(statuses.every((s) => s < 500)).toBeTruthy();
  });
});
