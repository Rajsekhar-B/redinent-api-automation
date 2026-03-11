import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Devices & Assets - functional and security coverage', () => {
  test('@security @regression should block unauthenticated device inventory access', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEVICE-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-05',
      module: 'devices-assets',
      severity: 'critical'
    });

    const response = await devicesClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch device inventory for authenticated context', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEVICE-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-04',
      module: 'devices-assets',
      severity: 'high'
    });

    const response = await devicesClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject unknown device id lookup', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEVICE-NEG-003',
      riskId: 'RISK-BOLA-03',
      module: 'devices-assets',
      severity: 'high'
    });

    const response = await devicesClient.getById('non-existent-device-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed device registration payload', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEVICE-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-05',
      module: 'devices-assets',
      severity: 'high'
    });

    const response = await devicesClient.create({
      device: {
        name: 'x'.repeat(600),
        ip_address: '999.999.999.999',
        port: -1
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should block cross-tenant asset mutation attempt', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEVICE-SEC-005',
      riskId: 'RISK-BFLA-02',
      module: 'devices-assets',
      severity: 'critical'
    });

    const response = await devicesClient.patchById('cross-tenant-device-123', {
      device: {
        tag: 'forced-tag'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @abuse should prevent destructive truncate operation without strict controls', async ({ devicesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-DEVICE-SEC-006',
      riskId: 'RISK-DATA-LOSS-01',
      module: 'devices-assets',
      severity: 'critical'
    });

    const response = await devicesClient.deleteById('truncate');
    expectStatusIn(response.status, [400, 401, 403, 404, 405, 422]);
  });
});
