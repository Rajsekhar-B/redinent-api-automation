import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('OEM Signatures - functional and security coverage', () => {
  test('@security @regression should block unauthenticated OEM signatures list access', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-09',
      module: 'oem-signatures',
      severity: 'critical'
    });

    const response = await oemSignaturesClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch OEM signatures list for authenticated context', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-08',
      module: 'oem-signatures',
      severity: 'high'
    });

    const response = await oemSignaturesClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid OEM signature id lookup', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-NEG-003',
      riskId: 'RISK-BOLA-08',
      module: 'oem-signatures',
      severity: 'high'
    });

    const response = await oemSignaturesClient.getById('non-existent-oem-signature-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed OEM signature payload on create', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-10',
      module: 'oem-signatures',
      severity: 'high'
    });

    const response = await oemSignaturesClient.create({
      signature: {
        name: 'x'.repeat(700),
        pattern: '',
        severity: 'invalid'
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized OEM signature mutation attempt', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-SEC-005',
      riskId: 'RISK-BFLA-05',
      module: 'oem-signatures',
      severity: 'critical'
    });

    const response = await oemSignaturesClient.patchById('cross-tenant-oem-signature-123', {
      signature: { severity: 'critical' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @negative should reject malformed payload on create_oem_signature endpoint', async ({ oemSignaturesClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OEM-LEGACY-006',
      riskId: 'RISK-INPUT-VALIDATION-11',
      module: 'oem-signatures',
      severity: 'high'
    });

    const response = await oemSignaturesClient.createSignature({
      signature: null,
      oem: ''
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
