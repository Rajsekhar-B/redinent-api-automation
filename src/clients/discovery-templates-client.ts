import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class DiscoveryTemplatesClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private templatePath(id: string): string {
    return endpointMap.discoveryTemplates.getById.replace(':id', encodeURIComponent(id));
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async list(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.discoveryTemplates.list);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async listWithoutAuth(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.discoveryTemplates.list, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.templatePath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async create(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.discoveryTemplates.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(this.templatePath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async callRoute(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    route: string,
    payload?: JsonLike
  ): Promise<{ status: number; body: JsonLike }> {
    let response;
    if (method === 'GET') {
      response = await this.get(route);
    } else if (method === 'POST') {
      response = await this.post(route, payload ?? {});
    } else if (method === 'PUT') {
      response = await this.put(route, payload ?? {});
    } else if (method === 'PATCH') {
      response = await this.patch(route, payload ?? {});
    } else {
      response = await this.delete(route);
    }

    return { status: response.status(), body: await this.parseBody(response) };
  }
}
