import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class DiscoveriesClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private discoveryPath(id: string): string {
    return endpointMap.discoveries.getById.replace(':id', encodeURIComponent(id));
  }

  private togglePath(id: string): string {
    return endpointMap.discoveries.toggleScanStatus.replace(':id', encodeURIComponent(id));
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async list(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.discoveries.list);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async listWithoutAuth(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.discoveries.list, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.discoveryPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async create(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.discoveries.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(this.discoveryPath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async toggleScanStatus(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(this.togglePath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getStatus(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.discoveries.status);
    return { status: response.status(), body: await this.parseBody(response) };
  }
}
