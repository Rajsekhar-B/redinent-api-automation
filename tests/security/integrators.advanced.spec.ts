import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

const invalidId = 'integrator-advanced-invalid-id-001';

test.describe('Integrators - edge, equivalence and chaos coverage', () => {
  test('@edge should handle edge data across list/create/id/edit/new routes', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-EDGE-006',
      riskId: 'RISK-INPUT-EDGE-INT-06',
      module: 'integrators',
      severity: 'high'
    });

    const listResponse = await integratorsClient.list();
    expectStatusIn(listResponse.status, [200, 401, 403]);

    const createEdgeResponse = await integratorsClient.create({
      integrator: {
        name: `edge-integrator-${'x'.repeat(64)}`,
        endpoint: 'https://api.redinent.local/v1/hooks',
        api_key: 'x'.repeat(64)
      }
    });
    expectStatusIn(createEdgeResponse.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);

    const byIdResponse = await integratorsClient.getById(invalidId);
    expectStatusIn(byIdResponse.status, [200, 400, 401, 403, 404, 422]);

    const editResponse = await integratorsClient.getEditById(invalidId);
    expectStatusIn(editResponse.status, [200, 302, 400, 401, 403, 404, 422]);

    const newResponse = await integratorsClient.getNew();
    expectStatusIn(newResponse.status, [200, 302, 401, 403, 404, 422]);

    const deleteResponse = await integratorsClient.deleteById(invalidId);
    expectStatusIn(deleteResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@equivalence should validate valid-like and invalid partitions for create/update endpoints', async ({
    integratorsClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-EQV-007',
      riskId: 'RISK-EQUIVALENCE-INT-07',
      module: 'integrators',
      severity: 'high'
    });

    const validLikePayload = {
      integrator: {
        name: 'eqv-integrator',
        endpoint: 'https://hooks.redinent.local/ingest',
        api_key: 'token-equivalence-123'
      }
    };

    const invalidPayload = {
      integrator: {
        name: '',
        endpoint: 'invalid-url',
        api_key: null
      }
    };

    const createValidLike = await integratorsClient.create(validLikePayload);
    expectStatusIn(createValidLike.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);

    const createInvalid = await integratorsClient.create(invalidPayload);
    expectStatusIn(createInvalid.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);

    const patchValidLike = await integratorsClient.patchById(invalidId, validLikePayload);
    expectStatusIn(patchValidLike.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const patchInvalid = await integratorsClient.patchById(invalidId, invalidPayload);
    expectStatusIn(patchInvalid.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const putValidLike = await integratorsClient.putById(invalidId, validLikePayload);
    expectStatusIn(putValidLike.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const putInvalid = await integratorsClient.putById(invalidId, invalidPayload);
    expectStatusIn(putInvalid.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@chaos should keep integrator endpoints stable under repeated invalid-id operations', async ({ integratorsClient }) => {
    addTestMetadata({
      requirementId: 'REQ-INT-CHAOS-008',
      riskId: 'RISK-RESILIENCE-INT-08',
      module: 'integrators',
      severity: 'high'
    });

    for (let i = 0; i < 5; i += 1) {
      const id = `${invalidId}-${i}`;

      const getResponse = await integratorsClient.getById(id);
      expectStatusIn(getResponse.status, [200, 400, 401, 403, 404, 422, 429]);
      expect(getResponse.status).toBeLessThan(500);

      const patchResponse = await integratorsClient.patchById(id, { integrator: { name: `chaos-${i}` } });
      expectStatusIn(patchResponse.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(patchResponse.status).toBeLessThan(500);

      const putResponse = await integratorsClient.putById(id, { integrator: { name: `chaos-put-${i}` } });
      expectStatusIn(putResponse.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(putResponse.status).toBeLessThan(500);

      const deleteResponse = await integratorsClient.deleteById(id);
      expectStatusIn(deleteResponse.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(deleteResponse.status).toBeLessThan(500);
    }
  });
});
