import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteSpec = { method: HttpMethod; path: string };

const invalidId = 'oem-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/oemsignatures' },
  { method: 'POST', path: '/oemsignatures' },
  { method: 'DELETE', path: '/oemsignatures/:id' },
  { method: 'GET', path: '/oemsignatures/:id' },
  { method: 'PATCH', path: '/oemsignatures/:id' },
  { method: 'PUT', path: '/oemsignatures/:id' },
  { method: 'GET', path: '/oemsignatures/:id/edit' },
  { method: 'POST', path: '/oemsignatures/create_oem_signature' },
  { method: 'GET', path: '/oemsignatures/download_sample_csv' },
  { method: 'GET', path: '/oemsignatures/import_signature_form' },
  { method: 'GET', path: '/oemsignatures/new' },
  { method: 'POST', path: '/oemsignatures/signature_import' }
];

const acceptedStatuses = [
  200, 201, 202, 203, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];

const knownDefectOps = new Set<string>([]);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(route: string, aspect: 'edge' | 'equivalence' | 'chaos'): Record<string, unknown> {
  if (route === '/oemsignatures/create_oem_signature') {
    return {
      signature: {
        name: aspect === 'edge' ? `edge-signature-${'x'.repeat(120)}` : `sig-${aspect}`,
        pattern: aspect === 'equivalence' ? 'AA-BB-CC' : '',
        severity: aspect === 'equivalence' ? 'high' : 'invalid'
      }
    };
  }

  if (route === '/oemsignatures/signature_import') {
    return {
      import: {
        filename: aspect === 'equivalence' ? 'oem-signatures.csv' : '',
        format: 'csv'
      }
    };
  }

  return {
    signature: {
      name: aspect === 'edge' ? `edge-oem-${'y'.repeat(90)}` : `oem-${aspect}`,
      pattern: aspect === 'equivalence' ? '11-22-33' : '',
      severity: aspect === 'equivalence' ? 'medium' : 'invalid'
    }
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos',
  iterations: number,
  oemSignaturesClient: {
    callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }>;
  }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(route.path, aspect);
      const response = await oemSignaturesClient.callRoute(route.method, resolvedPath, payload);
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

test.describe('OEM Signatures - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending OEM-signature routes with edge datasets', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-OEM-07',
      module: 'oem-signatures',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, oemSignaturesClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending OEM-signature routes with equivalence partitions', async ({
    oemSignaturesClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-EQV-008',
      riskId: 'RISK-EQUIVALENCE-OEM-08',
      module: 'oem-signatures',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, oemSignaturesClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending OEM-signature routes stable under repeated execution', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-CHAOS-009',
      riskId: 'RISK-RESILIENCE-OEM-09',
      module: 'oem-signatures',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, oemSignaturesClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
