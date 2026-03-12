import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class OemSignaturesClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private signaturePath(id: string): string {
    return endpointMap.oemSignatures.getById.replace(':id', encodeURIComponent(id));
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async list(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.oemSignatures.list);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async listWithoutAuth(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.oemSignatures.list, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.signaturePath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async create(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.oemSignatures.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(this.signaturePath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async createSignature(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.oemSignatures.createSignature, payload);
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
