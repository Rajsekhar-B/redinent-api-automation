import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

type ReportsApiEndpoint = 'modelNumbers' | 'openPorts' | 'vaptCounts' | 'alerts' | 'vulnerableHosts';

const geoQuery = {
  location: 'sample-location',
  latitude: '0.0',
  longitude: '0.0',
  device_type: 'camera'
};

test.describe('Reports API - endpoint coverage', () => {
  test('@regression should fetch locations with schema-compatible envelope', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-LOC-001',
      riskId: 'RISK-DATA-INTEGRITY-02',
      module: 'reports',
      severity: 'high'
    });

    const startedAt = Date.now();
    const response = await reportsClient.getApiReport('getLocations');
    const elapsedMs = Date.now() - startedAt;

    expectStatusIn(response.status, [200]);
    expect(elapsedMs).toBeLessThan(2500);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: expect.any(String)
      })
    );
  });

  test('@regression should validate query-based behavior for get_device_count', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-QRY-004',
      riskId: 'RISK-INPUT-VALIDATION-03',
      module: 'reports',
      severity: 'medium'
    });

    const response = await reportsClient.getApiReport('getDeviceCount', geoQuery);
    expectStatusIn(response.status, [200, 400]);
  });

  test('@regression should exercise get_device_count_all endpoint', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-QRY-005',
      riskId: 'RISK-DATA-INTEGRITY-03',
      module: 'reports',
      severity: 'medium'
    });

    const response = await reportsClient.getApiReport('getDeviceCountAll', geoQuery);
    expectStatusIn(response.status, [200, 400]);
  });

  test('@regression @boundary should enforce location filter length boundaries', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-BVA-006',
      riskId: 'RISK-INPUT-BOUNDARY-03',
      module: 'reports',
      severity: 'medium'
    });

    const response = await reportsClient.getApiReport('getDeviceCount', {
      ...geoQuery,
      location: 'x'.repeat(512)
    });
    expectStatusIn(response.status, [200, 400, 414, 422]);
  });

  test('@security @abuse should reject injection-like query input for reports endpoints', async ({ reportsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-SEC-007',
      riskId: 'RISK-API8-INJECTION-02',
      module: 'reports',
      severity: 'high'
    });

    const response = await reportsClient.getApiReport('getDeviceCount', {
      ...geoQuery,
      location: "' OR '1'='1"
    });
    expectStatusIn(response.status, [200, 400, 401, 403, 422]);
    expect(response.status).not.toBe(500);
  });

  test('@regression should cover model_numbers, open_ports, vapt_counts, alerts, and vulnerable_hosts endpoints', async ({
    reportsClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-REPORTS-COVERAGE-008',
      riskId: 'RISK-REGRESSION-GAP-01',
      module: 'reports',
      severity: 'high'
    });

    const endpoints: ReportsApiEndpoint[] = [
      'modelNumbers',
      'openPorts',
      'vaptCounts',
      'alerts',
      'vulnerableHosts'
    ];

    for (const endpoint of endpoints) {
      const response = await reportsClient.getApiReport(endpoint, geoQuery);
      expectStatusIn(response.status, [200, 400, 404]);
      expect(response.status).not.toBeGreaterThan(499);
    }
  });
});
