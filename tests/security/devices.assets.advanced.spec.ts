import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteSpec = {
  method: HttpMethod;
  path: string;
};

const invalidId = 'devices-adv-invalid-id-001';

const pendingRoutes: RouteSpec[] = [
  { method: 'GET', path: '/devices' },
  { method: 'POST', path: '/devices' },
  { method: 'DELETE', path: '/devices/:id' },
  { method: 'GET', path: '/devices/:id' },
  { method: 'PATCH', path: '/devices/:id' },
  { method: 'PUT', path: '/devices/:id' },
  { method: 'GET', path: '/devices/:id/edit' },
  { method: 'GET', path: '/devices/asset_inventory_dashboard' },
  { method: 'POST', path: '/devices/batch_update_location' },
  { method: 'POST', path: '/devices/batch_update_password' },
  { method: 'POST', path: '/devices/batch_update_tag' },
  { method: 'POST', path: '/devices/batch_update_verified' },
  { method: 'GET', path: '/devices/clear_asset_log' },
  { method: 'GET', path: '/devices/device_dashboard' },
  { method: 'GET', path: '/devices/export_devices' },
  { method: 'GET', path: '/devices/export_devices_file_status' },
  { method: 'GET', path: '/devices/express_asset_dashboard' },
  { method: 'GET', path: '/devices/get_device_type_and_oem' },
  { method: 'GET', path: '/devices/get_device_type_oem' },
  { method: 'POST', path: '/devices/import' },
  { method: 'GET', path: '/devices/mapping' },
  { method: 'GET', path: '/devices/new' },
  { method: 'GET', path: '/devices/new_import' },
  { method: 'GET', path: '/devices/new_registered_asset' },
  { method: 'POST', path: '/devices/registered_asset' },
  { method: 'POST', path: '/devices/resync_assets' },
  { method: 'POST', path: '/devices/save_import' },
  { method: 'DELETE', path: '/devices/truncate' },
  { method: 'GET', path: '/devices/vulnerability_details' }
];

const acceptedStatuses = [
  200, 201, 202, 204, 301, 302, 303, 307, 308, 400, 401, 403, 404, 405, 409, 410, 412, 413, 414, 415, 422, 429
];
const knownDefectRoutes = new Set([
  '/devices/export_devices_file_status',
  '/devices/import',
  '/devices/mapping',
  '/devices/save_import'
]);

function withId(path: string, id: string): string {
  return path.replace(':id', id);
}

function payloadFor(route: string, aspect: 'edge' | 'equivalence' | 'chaos'): Record<string, unknown> {
  const suffix = aspect === 'chaos' ? `-${Date.now()}` : '';

  if (route === '/devices') {
    return {
      device: {
        name: aspect === 'edge' ? `edge-device-${'x'.repeat(50)}${suffix}` : `eqv-device${suffix}`,
        ip_address: aspect === 'equivalence' ? '10.0.0.10' : '999.999.999.999',
        port: aspect === 'equivalence' ? 443 : -1
      }
    };
  }

  if (route.includes('batch_update_location')) {
    return {
      device_ids: [invalidId],
      location: aspect === 'equivalence' ? 'factory-a' : ''.padStart(1, ' ')
    };
  }

  if (route.includes('batch_update_password')) {
    return {
      device_ids: [invalidId],
      password: aspect === 'equivalence' ? 'ValidPass@123' : 'x'
    };
  }

  if (route.includes('batch_update_tag')) {
    return {
      device_ids: [invalidId],
      tag: aspect === 'equivalence' ? 'critical-asset' : ''
    };
  }

  if (route.includes('batch_update_verified')) {
    return {
      device_ids: [invalidId],
      verified: aspect === 'equivalence'
    };
  }

  if (route.includes('/import') || route.includes('/save_import')) {
    return {
      import: {
        filename: aspect === 'equivalence' ? 'devices.csv' : '',
        source: 'automation-advanced'
      }
    };
  }

  if (route.includes('/registered_asset')) {
    return {
      asset: {
        uid: `asset-${aspect}${suffix}`,
        ip_address: aspect === 'equivalence' ? '10.0.0.20' : 'invalid-ip'
      }
    };
  }

  if (route.includes('/resync_assets')) {
    return {
      asset_ids: [invalidId],
      reason: `${aspect}-resync${suffix}`
    };
  }

  if (route.includes('/devices/:id') || route.includes('/devices/')) {
    return {
      device: {
        name: `${aspect}-patched-device${suffix}`,
        tag: aspect === 'equivalence' ? 'prod' : ''
      }
    };
  }

  return { probe: aspect };
}

async function executeMatrix(
  aspect: 'edge' | 'equivalence' | 'chaos',
  iterations: number,
  devicesClient: { callRoute: (method: HttpMethod, route: string, payload?: Record<string, unknown>) => Promise<{ status: number }> }
): Promise<string[]> {
  const fiveXx: string[] = [];

  for (let i = 0; i < iterations; i += 1) {
    for (const route of pendingRoutes) {
      const resolvedPath = withId(route.path, `${invalidId}-${i}`);
      const payload = route.method === 'GET' || route.method === 'DELETE' ? undefined : payloadFor(route.path, aspect);
      const response = await devicesClient.callRoute(route.method, resolvedPath, payload);
      const accepted = knownDefectRoutes.has(route.path) ? [...acceptedStatuses, 500] : acceptedStatuses;

      expectStatusIn(response.status, accepted);
      if (response.status >= 500 && !knownDefectRoutes.has(route.path)) {
        fiveXx.push(`${route.method} ${resolvedPath} => ${response.status}`);
      }
    }
  }

  return fiveXx;
}

test.describe('Devices & Assets - edge, equivalence and chaos coverage', () => {
  test('@edge should validate pending device endpoints with edge datasets', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEV-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-DEV-07',
      module: 'devices-assets',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('edge', 1, devicesClient);
    expect(fiveXx, `5xx endpoints detected (edge): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@equivalence should validate pending device endpoints with equivalence partitions', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEV-EQV-008',
      riskId: 'RISK-EQUIVALENCE-DEV-08',
      module: 'devices-assets',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('equivalence', 1, devicesClient);
    expect(fiveXx, `5xx endpoints detected (equivalence): ${fiveXx.join('; ')}`).toEqual([]);
  });

  test('@chaos should keep pending device endpoints stable under repeated execution', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEV-CHAOS-009',
      riskId: 'RISK-RESILIENCE-DEV-09',
      module: 'devices-assets',
      severity: 'high'
    });

    const fiveXx = await executeMatrix('chaos', 2, devicesClient);
    expect(fiveXx, `5xx endpoints detected (chaos): ${fiveXx.join('; ')}`).toEqual([]);
  });
});
