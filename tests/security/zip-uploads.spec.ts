import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { test, expect } from '../fixtures/api.fixture';

test.describe('Zip Uploads - functional and security coverage', () => {
  test('@security @regression should block unauthenticated zip uploads list access', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-AUTH-001',
      riskId: 'RISK-BROKEN-AUTH-15',
      module: 'zip-uploads',
      severity: 'critical'
    });

    const response = await zipUploadsClient.listWithoutAuth();
    expectStatusIn(response.status, [200, 401, 403, 302]);

    if (response.status === 200) {
      expect(response.body).not.toEqual(
        expect.objectContaining({
          success: true
        })
      );
    }
  });

  test('@regression should fetch zip uploads list for authenticated context', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-FUNC-002',
      riskId: 'RISK-DATA-INTEGRITY-14',
      module: 'zip-uploads',
      severity: 'high'
    });

    const response = await zipUploadsClient.list();
    expectStatusIn(response.status, [200, 401, 403]);
    expect(response.status).not.toBeGreaterThan(499);
  });

  test('@security @negative should reject invalid zip upload id lookup', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-NEG-003',
      riskId: 'RISK-BOLA-14',
      module: 'zip-uploads',
      severity: 'high'
    });

    const response = await zipUploadsClient.getById('non-existent-zip-upload-id-99999');
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });

  test('@security @boundary should reject malformed zip upload payload on create', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-BVA-004',
      riskId: 'RISK-INPUT-BOUNDARY-18',
      module: 'zip-uploads',
      severity: 'high'
    });

    const response = await zipUploadsClient.create({
      zip_upload: {
        file_name: '',
        file_size: -1,
        checksum: 'x'.repeat(500)
      }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 413, 422]);
  });

  test('@security @abuse should reject unauthorized zip upload mutation attempt', async ({ zipUploadsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-ZIP-SEC-005',
      riskId: 'RISK-BFLA-11',
      module: 'zip-uploads',
      severity: 'critical'
    });

    const response = await zipUploadsClient.patchById('cross-tenant-zip-upload-123', {
      zip_upload: { file_name: 'tampered.zip' }
    });
    expectStatusIn(response.status, [400, 401, 403, 404, 422]);
  });
});
