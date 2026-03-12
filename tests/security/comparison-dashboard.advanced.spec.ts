import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteSpec = { method: HttpMethod; path: string };

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/comparison_dashboard' },
  { method: 'POST', path: '/comparison_dashboard/fetch_comparison_data' },
  { method: 'GET', path: '/export_quaterly_vulnerability' },
  { method: 'GET', path: '/fetch_vuln_details' },
  { method: 'GET', path: '/quarterly_details' },
  { method: 'GET', path: '/quaterly_vulnerability_dashboard' }
];

const acceptedStatuses = [
  200, 201, 202, 203, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];

const knownDefectOps = new Set<string>([]);

function payloadFor(aspect: 'edge' | 'equivalence' | 'chaos' | 'abuse'): Record<string, unknown> {
  if (aspect === 'abuse') {
    return {
      quarter: 'Q1',
      year: 2026,
      tenant: "' OR 1=1 --",
      filters: {
        sort: 'risk_score; DROP TABLE users; --',
        limit: 100000
      }
    };
  }

  return {
    quarter: aspect === 'equivalence' ? 'Q1' : 'Q13',
    year: aspect === 'equivalence' ? 2026 : -1,
    tenant: aspect === 'equivalence' ? 'default' : null
  };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos' | 'abuse',
  iterations: number,
  comparisonDashboardClient: {
    callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }>;
  }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const payload = route.method === 'GET' ? undefined : payloadFor(aspect);
      const response = await comparisonDashboardClient.callRoute(route.method, route.path, payload);
      const opKey = `${route.method} ${route.path}`;

      if (response.status >= 500) {
        if (!knownDefectOps.has(opKey)) {
          fiveXx.push(`${route.method} ${route.path} => ${response.status}`);
        }
        continue;
      }

      expectStatusIn(response.status, acceptedStatuses);
    }
  }

  return fiveXx;
}

test.describe('Comparison Dashboard - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending comparison-dashboard routes with edge datasets', async ({ comparisonDashboardClient }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-EDGE-006',
      riskId: 'RISK-INPUT-EDGE-CMP-06',
      module: 'comparison-dashboard',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, comparisonDashboardClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending comparison-dashboard routes with equivalence partitions', async ({
    comparisonDashboardClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-EQV-007',
      riskId: 'RISK-EQUIVALENCE-CMP-07',
      module: 'comparison-dashboard',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, comparisonDashboardClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@abuse should reject abuse-pattern payloads across comparison-dashboard routes without 5xx', async ({
    comparisonDashboardClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-ABUSE-009',
      riskId: 'RISK-ABUSE-CMP-09',
      module: 'comparison-dashboard',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('abuse', 1, comparisonDashboardClient);
    expect(fiveXx, `5xx endpoints detected (abuse): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending comparison-dashboard routes stable under repeated execution', async ({
    comparisonDashboardClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-CMP-CHAOS-008',
      riskId: 'RISK-RESILIENCE-CMP-08',
      module: 'comparison-dashboard',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, comparisonDashboardClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
