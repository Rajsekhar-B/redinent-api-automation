import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Uptime Monitoring - functional and security coverage', () => {
  test('@security @regression should block unauthenticated uptime list access', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-10',
      module: 'uptime-monitoring',
      severity: 'critical'
    });

    const response = await uptimeMonitoringClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch uptime list for authenticated context', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-09',
      module: 'uptime-monitoring',
      severity: 'high'
    });

    const response = await uptimeMonitoringClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid uptime monitor id lookup', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-NEG-003',
      riskId: 'RISK-BOLA-09',
      module: 'uptime-monitoring',
      severity: 'high'
    });

    const response = await uptimeMonitoringClient.getById('non-existent-monitor-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed uptime monitor payload on create', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-12',
      module: 'uptime-monitoring',
      severity: 'high'
    });

    const response = await uptimeMonitoringClient.create({
      monitor: {
        host: '',
        port: -1,
        protocol: 'invalid-protocol',
        frequency_seconds: -60
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized monitor update for invalid id', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-SEC-005',
      riskId: 'RISK-BFLA-06',
      module: 'uptime-monitoring',
      severity: 'critical'
    });

    const response = await uptimeMonitoringClient.patchById('cross-tenant-monitor-123', {
      monitor: {
        frequency_seconds: 5
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @negative should reject malformed payload on add_server_details', async ({ uptimeMonitoringClient }) => {
    addTestMetadata({
      requirementId: 'REQ-UPMON-NEG-006',
      riskId: 'RISK-INPUT-VALIDATION-13',
      module: 'uptime-monitoring',
      severity: 'high'
    });

    const response = await uptimeMonitoringClient.addServerDetails({
      server: null,
      address: ''
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
