import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class ComparisonDashboardClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async index(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.comparisonDashboard.index);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async indexWithoutAuth(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.comparisonDashboard.index, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async fetchComparisonData(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.comparisonDashboard.fetchComparisonData, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getPublicDashboard(
    key:
      | 'exportQuarterlyVulnerability'
      | 'fetchVulnerabilityDetails'
      | 'quarterlyDetails'
      | 'quarterlyVulnerabilityDashboard'
  ): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.comparisonDashboard[key]);
    return { status: response.status(), body: await this.parseBody(response) };
  }
}
