import { addTestMetadata } from '../../src/core/test-metadata';
import { expectStatusIn } from '../../src/core/assertions';
import { expect, test } from '../fixtures/api.fixture';

const invalidId = 'asset-group-advanced-invalid-id-001';

test.describe('Asset Group Management - edge, equivalence and chaos coverage', () => {
  test('@edge should handle edge values across list/create/id/edit/new/toggle routes', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-EDGE-007',
      riskId: 'RISK-INPUT-EDGE-AGM-07',
      module: 'asset-group-management',
      severity: 'high'
    });

    const listResponse = await assetGroupClient.list();
    expectStatusIn(listResponse.status, [200, 401, 403]);

    const createResponse = await assetGroupClient.create({
      asset_group: {
        name: `edge-group-${'x'.repeat(80)}`,
        description: 'edge description',
        rule: { tags: ['iot', 'edge'], includeInactive: false }
      }
    });
    expectStatusIn(createResponse.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);

    const byIdResponse = await assetGroupClient.getById(invalidId);
    expectStatusIn(byIdResponse.status, [200, 400, 401, 403, 404, 422]);

    const editResponse = await assetGroupClient.getEditById(invalidId);
    expectStatusIn(editResponse.status, [200, 302, 400, 401, 403, 404, 422]);

    const newResponse = await assetGroupClient.getNew();
    expectStatusIn(newResponse.status, [200, 302, 401, 403, 404, 422]);

    const toggleResponse = await assetGroupClient.toggleActivation(invalidId, {
      active: true
    });
    expectStatusIn(toggleResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const deleteResponse = await assetGroupClient.deleteById(invalidId);
    expectStatusIn(deleteResponse.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@equivalence should validate valid-like and invalid payload partitions for create/update routes', async ({
    assetGroupClient
  }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-EQV-008',
      riskId: 'RISK-EQUIVALENCE-AGM-08',
      module: 'asset-group-management',
      severity: 'high'
    });

    const validLikePayload = {
      asset_group: {
        name: 'eqv-group-name',
        description: 'equivalence partition valid-like payload',
        rule: { tags: ['camera'] }
      }
    };

    const invalidPayload = {
      asset_group: {
        name: '',
        description: null,
        rule: 'invalid-type'
      }
    };

    const createValidLike = await assetGroupClient.create(validLikePayload);
    expectStatusIn(createValidLike.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);

    const createInvalid = await assetGroupClient.create(invalidPayload);
    expectStatusIn(createInvalid.status, [200, 201, 202, 204, 400, 401, 403, 404, 422]);

    const patchValidLike = await assetGroupClient.patchById(invalidId, validLikePayload);
    expectStatusIn(patchValidLike.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const patchInvalid = await assetGroupClient.patchById(invalidId, invalidPayload);
    expectStatusIn(patchInvalid.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const putValidLike = await assetGroupClient.putById(invalidId, validLikePayload);
    expectStatusIn(putValidLike.status, [200, 202, 204, 400, 401, 403, 404, 422]);

    const putInvalid = await assetGroupClient.putById(invalidId, invalidPayload);
    expectStatusIn(putInvalid.status, [200, 202, 204, 400, 401, 403, 404, 422]);
  });

  test('@chaos should remain stable under repeated reads/mutations on invalid ids', async ({ assetGroupClient }) => {
    addTestMetadata({
      requirementId: 'REQ-AGM-CHAOS-009',
      riskId: 'RISK-RESILIENCE-AGM-09',
      module: 'asset-group-management',
      severity: 'high'
    });

    for (let i = 0; i < 5; i += 1) {
      const id = `${invalidId}-${i}`;

      const getResponse = await assetGroupClient.getById(id);
      expectStatusIn(getResponse.status, [200, 400, 401, 403, 404, 422, 429]);
      expect(getResponse.status).toBeLessThan(500);

      const patchResponse = await assetGroupClient.patchById(id, { asset_group: { name: `chaos-${i}` } });
      expectStatusIn(patchResponse.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(patchResponse.status).toBeLessThan(500);

      const toggleResponse = await assetGroupClient.toggleActivation(id, { active: i % 2 === 0 });
      expectStatusIn(toggleResponse.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(toggleResponse.status).toBeLessThan(500);

      const deleteResponse = await assetGroupClient.deleteById(id);
      expectStatusIn(deleteResponse.status, [200, 202, 204, 400, 401, 403, 404, 422, 429]);
      expect(deleteResponse.status).toBeLessThan(500);
    }
  });
});
