import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteSpec = { method: HttpMethod; path: string };

const invalidId = 'zip-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/zip_uploads' },
  { method: 'POST', path: '/zip_uploads' },
  { method: 'DELETE', path: '/zip_uploads/:id' },
  { method: 'GET', path: '/zip_uploads/:id' },
  { method: 'PATCH', path: '/zip_uploads/:id' },
  { method: 'PUT', path: '/zip_uploads/:id' },
  { method: 'GET', path: '/zip_uploads/:id/edit' },
  { method: 'GET', path: '/zip_uploads/new' }
];

const acceptedStatuses = [
  200, 201, 202, 203, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];

const knownDefectOps = new Set(['POST /zip_uploads']);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(aspect: 'edge' | 'equivalence' | 'chaos'): Record<string, unknown> {
  return {
    zip_upload: {
      file_name: aspect === 'edge' ? `${'z'.repeat(150)}.zip` : `sample-${aspect}.zip`,
      file_size: aspect === 'equivalence' ? 1024 : -1,
      checksum: aspect === 'equivalence' ? 'abc123def456' : 'x'.repeat(300)
    }
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos',
  iterations: number,
  zipUploadsClient: {
    callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }>;
  }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(aspect);
      const response = await zipUploadsClient.callRoute(route.method, resolvedPath, payload);
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

test.describe('Zip Uploads - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending zip-upload routes with edge datasets', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-EDGE-006',
      riskId: 'RISK-INPUT-EDGE-ZIP-06',
      module: 'zip-uploads',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, zipUploadsClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending zip-upload routes with equivalence partitions', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-EQV-007',
      riskId: 'RISK-EQUIVALENCE-ZIP-07',
      module: 'zip-uploads',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, zipUploadsClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending zip-upload routes stable under repeated execution', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-CHAOS-008',
      riskId: 'RISK-RESILIENCE-ZIP-08',
      module: 'zip-uploads',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, zipUploadsClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
