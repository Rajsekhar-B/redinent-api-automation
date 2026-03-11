import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import {
  buildSeededReportCreatePayload,
  buildSeededReportPatchPayload,
  buildSeededReportPutPayload
} from '../../src/factories/report-factory';
import { expect, test } from '../fixtures/api.fixture';

type JsonLike = Record<string, unknown>;

function extractReportId(body: JsonLike): string | null {
  const candidates = [
    body.id,
    body.report_id,
    (body.report as JsonLike | undefined)?.id,
    (body.data as JsonLike | undefined)?.id
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate);
  }
  return null;
}

test.describe('Other module - reports seeded lifecycle workflow', () => {
  let createdReportId: string | null = null;

  test.beforeEach(async ({ otherClient }) => {
    const createResponse = await otherClient.createReport(buildSeededReportCreatePayload());
    expectStatusIn(createResponse.status, [200, 201]);

    createdReportId = extractReportId(createResponse.body);
    expect(createdReportId).not.toBeNull();
  });

  test.afterEach(async ({ otherClient }) => {
    if (!createdReportId) return;
    const cleanup = await otherClient.deleteReportById(createdReportId);
    expectStatusIn(cleanup.status, [200, 202, 204, 404]);
    createdReportId = null;
  });

  test('@regression @positive should complete report lifecycle create-get-patch-put-delete', async ({ otherClient }) => {
    addTestMetadata({
      requirementId: 'REQ-OTHER-LFC-001',
      riskId: 'RISK-DATA-INTEGRITY-OTHER-19',
      module: 'other',
      severity: 'critical'
    });

    const reportId = createdReportId as string;

    const getAfterCreate = await otherClient.getReportById(reportId);
    expectStatusIn(getAfterCreate.status, [200, 201]);

    const patchResponse = await otherClient.patchReportById(reportId, buildSeededReportPatchPayload());
    expectStatusIn(patchResponse.status, [200, 204]);

    const getAfterPatch = await otherClient.getReportById(reportId);
    expectStatusIn(getAfterPatch.status, [200, 201]);

    const putResponse = await otherClient.putReportById(reportId, buildSeededReportPutPayload());
    expectStatusIn(putResponse.status, [200, 204]);

    const getAfterPut = await otherClient.getReportById(reportId);
    expectStatusIn(getAfterPut.status, [200, 201]);

    const deleteResponse = await otherClient.deleteReportById(reportId);
    expectStatusIn(deleteResponse.status, [200, 202, 204]);

    const getAfterDelete = await otherClient.getReportById(reportId);
    expectStatusIn(getAfterDelete.status, [404, 410]);

    createdReportId = null;
  });
});
