import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class HomeDashboardsClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private homePath(id: string): string {
    return endpointMap.homeDashboards.getById.replace(':id', encodeURIComponent(id));
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async list(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.homeDashboards.list);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async listWithoutAuth(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.homeDashboards.list, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.homePath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async create(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.homeDashboards.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(this.homePath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async deleteById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.delete(this.homePath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getDashboard(
    key:
      | 'assetDiscoveryDashboard'
      | 'assetMonitoring'
      | 'externalSurface'
      | 'globalDashboard'
      | 'threatMonitor'
      | 'uptimeMonitoringDashboard'
  ): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.homeDashboards[key]);
    return { status: response.status(), body: await this.parseBody(response) };
  }
}
