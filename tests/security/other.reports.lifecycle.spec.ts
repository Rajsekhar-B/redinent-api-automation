import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import {
  buildSeededReportCreatePayload,
  buildSeededReportPatchPayload,
  buildSeededReportPutPayload
} from '../../src/factories/report-factory';
import { expect, test } from '../fixtures/api.fixture';

type JsonLike = Record<string, unknown>;

function readIdFromBody(body: JsonLike): string | undefined {
  const idCandidates = [
    body.id,
    (body.report as JsonLike | undefined)?.id,
    (body.data as JsonLike | undefined)?.id
  ];

  for (const candidate of idCandidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate;
    if (typeof candidate === 'number') return String(candidate);
  }
  return undefined;
}

test.describe('Other module - reports happy-path lifecycle with setup and teardown', () => {
  test('@smoke @positive should create report via POST /reports with valid seeded payload', async ({ otherClient }) => {
    test.fail(true, 'Known defect DEF-20260312-052: POST /reports returns 404 for valid seeded payload');

    addTestMetadata({
      requirementId: 'REQ-OTHER-LIFE-001',
      riskId: 'RISK-CORE-WORKFLOW-OTHER-22',
      module: 'other',
      severity: 'critical'
    });

    const createPayload = buildSeededReportCreatePayload();
    const createResponse = await otherClient.createReport(createPayload);

    expectStatusIn(createResponse.status, [200, 201]);
    const createdId = readIdFromBody(createResponse.body);
    expect(createdId, 'Created report id should be returned for lifecycle chaining').toBeTruthy();

    if (createdId) {
      const cleanup = await otherClient.deleteReportById(createdId);
      expectStatusIn(cleanup.status, [200, 202, 204, 404]);
    }
  });

  test('@regression @positive should execute report /reports/:id lifecycle using setup and teardown data', async ({ otherClient }) => {
    test.fail(true, 'Known defect DEF-20260312-052 blocks /reports/:id lifecycle at create step');

    addTestMetadata({
      requirementId: 'REQ-OTHER-LIFE-002',
      riskId: 'RISK-STATE-INTEGRITY-OTHER-23',
      module: 'other',
      severity: 'critical'
    });

    const createPayload = buildSeededReportCreatePayload();
    const createResponse = await otherClient.createReport(createPayload);
    expectStatusIn(createResponse.status, [200, 201]);

    const createdId = readIdFromBody(createResponse.body);
    expect(createdId, 'Created report id missing; cannot continue /reports/:id lifecycle').toBeTruthy();
    if (!createdId) return;

    const getResponse = await otherClient.getReportById(createdId);
    expectStatusIn(getResponse.status, [200]);

    const patchResponse = await otherClient.patchReportById(createdId, buildSeededReportPatchPayload());
    expectStatusIn(patchResponse.status, [200, 202, 204]);

    const putResponse = await otherClient.putReportById(createdId, buildSeededReportPutPayload());
    expectStatusIn(putResponse.status, [200, 202, 204]);

    const deleteResponse = await otherClient.deleteReportById(createdId);
    expectStatusIn(deleteResponse.status, [200, 202, 204]);

    const postDeleteLookup = await otherClient.getReportById(createdId);
    expectStatusIn(postDeleteLookup.status, [404, 410]);
  });
});
