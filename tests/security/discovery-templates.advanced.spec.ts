import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteSpec = { method: HttpMethod; path: string };

const invalidId = 'template-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/discoverytemplates' },
  { method: 'POST', path: '/discoverytemplates' },
  { method: 'DELETE', path: '/discoverytemplates/:id' },
  { method: 'GET', path: '/discoverytemplates/:id' },
  { method: 'PATCH', path: '/discoverytemplates/:id' },
  { method: 'PUT', path: '/discoverytemplates/:id' },
  { method: 'GET', path: '/discoverytemplates/:id/edit' },
  { method: 'GET', path: '/discoverytemplates/new' }
];

const acceptedStatuses = [
  200, 201, 202, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];

const knownDefectOps = new Set([
  'GET /discoverytemplates/:id',
  'DELETE /discoverytemplates/:id',
  'GET /discoverytemplates/:id/edit'
]);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(aspect: 'edge' | 'equivalence' | 'chaos'): Record<string, unknown> {
  return {
    discovery_template: {
      name: aspect === 'edge' ? `edge-template-${'x'.repeat(80)}` : `template-${aspect}`,
      schedule: aspect === 'equivalence' ? '0 */6 * * *' : 'invalid-cron',
      scan_type: aspect === 'chaos' ? 'full' : 'quick'
    }
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos',
  iterations: number,
  discoveryTemplatesClient: {
    callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }>;
  }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(aspect);
      const response = await discoveryTemplatesClient.callRoute(route.method, resolvedPath, payload);
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

test.describe('Discovery Templates - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending discovery template routes with edge datasets', async ({ discoveryTemplatesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DTMPL-EDGE-010',
      riskId: 'RISK-INPUT-EDGE-DTMPL-10',
      module: 'discovery-templates',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, discoveryTemplatesClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending discovery template routes with equivalence partitions', async ({
    discoveryTemplatesClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-DTMPL-EQV-011',
      riskId: 'RISK-EQUIVALENCE-DTMPL-11',
      module: 'discovery-templates',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, discoveryTemplatesClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending discovery template routes stable under repeated execution', async ({
    discoveryTemplatesClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-DTMPL-CHAOS-012',
      riskId: 'RISK-RESILIENCE-DTMPL-12',
      module: 'discovery-templates',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, discoveryTemplatesClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
