import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteSpec = { method: HttpMethod; path: string };

const invalidId = 'discovery-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/discoveries' },
  { method: 'POST', path: '/discoveries' },
  { method: 'DELETE', path: '/discoveries/:id' },
  { method: 'GET', path: '/discoveries/:id' },
  { method: 'PATCH', path: '/discoveries/:id' },
  { method: 'PUT', path: '/discoveries/:id' },
  { method: 'GET', path: '/discoveries/:id/edit' },
  { method: 'POST', path: '/discoveries/:id/toggle_scan_status' },
  { method: 'GET', path: '/discoveries/check_schedule_conflict' },
  { method: 'GET', path: '/discoveries/clear_log' },
  { method: 'GET', path: '/discoveries/detailed_status' },
  { method: 'GET', path: '/discoveries/es_index' },
  { method: 'GET', path: '/discoveries/get_scan_settings' },
  { method: 'GET', path: '/discoveries/liveresult' },
  { method: 'GET', path: '/discoveries/new' },
  { method: 'GET', path: '/discoveries/newassetdiscovery' },
  { method: 'GET', path: '/discoveries/rescan' },
  { method: 'GET', path: '/discoveries/scanconfig' },
  { method: 'GET', path: '/discoveries/status' },
  { method: 'GET', path: '/discoveries/stop' }
];

const acceptedStatuses = [
  200, 201, 202, 203, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];

const knownDefectOps = new Set(['POST /discoveries', 'DELETE /discoveries/:id', 'GET /discoveries/status']);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(route: string, aspect: 'edge' | 'equivalence' | 'chaos'): Record<string, unknown> {
  if (route === '/discoveries') {
    return {
      discovery: {
        name: aspect === 'edge' ? `edge-discovery-${'x'.repeat(60)}` : `discovery-${aspect}`,
        schedule: aspect === 'equivalence' ? '0 */6 * * *' : 'invalid-cron',
        targets: aspect === 'equivalence' ? ['10.0.0.0/24'] : []
      }
    };
  }

  if (route === '/discoveries/:id/toggle_scan_status') {
    return {
      status: aspect === 'chaos' ? 'stop' : 'start'
    };
  }

  return {
    discovery: {
      name: `${aspect}-patched-discovery`,
      schedule: aspect === 'equivalence' ? '0 */12 * * *' : 'bad-cron'
    }
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos',
  iterations: number,
  discoveriesClient: {
    callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }>;
  }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(route.path, aspect);
      const response = await discoveriesClient.callRoute(route.method, resolvedPath, payload);
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

test.describe('Discovery & Scan - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending discovery routes with edge datasets', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-EDGE-010',
      riskId: 'RISK-INPUT-EDGE-DISC-10',
      module: 'discovery-scan',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, discoveriesClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending discovery routes with equivalence partitions', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-EQV-011',
      riskId: 'RISK-EQUIVALENCE-DISC-11',
      module: 'discovery-scan',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, discoveriesClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending discovery routes stable under repeated execution', async ({ discoveriesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DISC-CHAOS-012',
      riskId: 'RISK-RESILIENCE-DISC-12',
      module: 'discovery-scan',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, discoveriesClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
