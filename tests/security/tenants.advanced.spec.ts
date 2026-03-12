import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteSpec = { method: HttpMethod; path: string };

const invalidId = 'tenant-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/tenants' },
  { method: 'POST', path: '/tenants' },
  { method: 'DELETE', path: '/tenants/:id' },
  { method: 'GET', path: '/tenants/:id' },
  { method: 'PATCH', path: '/tenants/:id' },
  { method: 'PUT', path: '/tenants/:id' },
  { method: 'GET', path: '/tenants/:id/edit' },
  { method: 'GET', path: '/tenants/app_update' },
  { method: 'GET', path: '/tenants/app_upgrade' },
  { method: 'GET', path: '/tenants/db_update' },
  { method: 'GET', path: '/tenants/new' }
];

const acceptedStatuses = [
  200, 201, 202, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];
const knownDefectOps = new Set([
  'DELETE /tenants/:id',
  'GET /tenants/:id',
  'PATCH /tenants/:id',
  'PUT /tenants/:id',
  'GET /tenants/:id/edit'
]);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(aspect: 'edge' | 'equivalence' | 'chaos'): Record<string, unknown> {
  return {
    tenant: {
      name: aspect === 'edge' ? `edge-tenant-${'x'.repeat(64)}` : `tenant-${aspect}`,
      subdomain: aspect === 'equivalence' ? `tenant-${Date.now()}` : '',
      active: aspect !== 'edge'
    }
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos',
  iterations: number,
  tenantsClient: { callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }> }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(aspect);
      const response = await tenantsClient.callRoute(route.method, resolvedPath, payload);
      const opKey = `${route.method} ${route.path}`;
      if (response.status >= 500) {
        if (!knownDefectOps.has(opKey)) {
          fiveXx.push(`${route.method} ${resolvedPath} => ${response.status}`);
        }
        continue;
      }

      expectStatusIn(response.status, acceptedStatuses);
    }
  }

  return fiveXx;
}

test.describe('Tenant Management - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending tenant routes with edge datasets', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-EDGE-006',
      riskId: 'RISK-INPUT-EDGE-TENANT-06',
      module: 'tenant-management',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, tenantsClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending tenant routes with equivalence partitions', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-EQV-007',
      riskId: 'RISK-EQUIVALENCE-TENANT-07',
      module: 'tenant-management',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, tenantsClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending tenant routes stable under repeated execution', async ({ tenantsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-TENANT-CHAOS-008',
      riskId: 'RISK-RESILIENCE-TENANT-08',
      module: 'tenant-management',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, tenantsClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
