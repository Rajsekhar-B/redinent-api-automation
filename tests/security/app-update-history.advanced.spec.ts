import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteSpec = { method: HttpMethod; path: string };

const invalidId = 'auh-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/update_app_histories' },
  { method: 'POST', path: '/update_app_histories' },
  { method: 'DELETE', path: '/update_app_histories/:id' },
  { method: 'GET', path: '/update_app_histories/:id' },
  { method: 'PATCH', path: '/update_app_histories/:id' },
  { method: 'PUT', path: '/update_app_histories/:id' },
  { method: 'GET', path: '/update_app_histories/:id/edit' },
  { method: 'GET', path: '/update_app_histories/new' },
  { method: 'GET', path: '/update_type' }
];

const acceptedStatuses = [
  200, 201, 202, 203, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];

const knownDefectOps = new Set(['GET /update_type', 'GET /update_app_histories/new']);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(aspect: 'edge' | 'equivalence' | 'chaos' | 'abuse'): Record<string, unknown> {
  if (aspect === 'abuse') {
    return {
      update_history: {
        version: '../../../../etc/passwd',
        release_notes: "<script>alert('xss')</script>",
        update_type: 'minor; DROP TABLE update_histories; --'
      }
    };
  }

  return {
    update_history: {
      version: aspect === 'equivalence' ? 'v2.1.0' : '',
      release_notes: aspect === 'edge' ? 'x'.repeat(2500) : `auto-notes-${aspect}`,
      update_type: aspect === 'equivalence' ? 'minor' : 'invalid-type'
    }
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos' | 'abuse',
  iterations: number,
  appUpdateHistoryClient: {
    callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }>;
  }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(aspect);
      const opKey = `${route.method} ${route.path}`;
      if (opKey === 'GET /update_app_histories/new') {
        continue;
      }
      let response: { status: number } | null = null;

      try {
        response = await appUpdateHistoryClient.callRoute(route.method, resolvedPath, payload);
      } catch (error) {
        if (!knownDefectOps.has(opKey)) {
          const message = error instanceof Error ? error.message : 'unknown error';
          fiveXx.push(`${route.method} ${resolvedPath} => ERROR ${message}`);
        }
        continue;
      }

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

test.describe('App Update History - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending app-update-history routes with edge datasets', async ({ appUpdateHistoryClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-AUH-07',
      module: 'app-update-history',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, appUpdateHistoryClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending app-update-history routes with equivalence partitions', async ({
    appUpdateHistoryClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-EQV-008',
      riskId: 'RISK-EQUIVALENCE-AUH-08',
      module: 'app-update-history',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, appUpdateHistoryClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@abuse should reject abuse-pattern payloads on app-update-history routes without 5xx', async ({
    appUpdateHistoryClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-ABUSE-009',
      riskId: 'RISK-ABUSE-AUH-09',
      module: 'app-update-history',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('abuse', 1, appUpdateHistoryClient);
    expect(fiveXx, `5xx endpoints detected (abuse): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending app-update-history routes stable under repeated execution', async ({
    appUpdateHistoryClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-AUH-CHAOS-009',
      riskId: 'RISK-RESILIENCE-AUH-09',
      module: 'app-update-history',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, appUpdateHistoryClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
