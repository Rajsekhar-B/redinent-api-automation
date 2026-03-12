import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

export class TenantsClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private parseTenantPath(id: string): string {
    return endpointMap.tenants.getById.replace(':id', encodeURIComponent(id));
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<Record<string, unknown>> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) {
      return {};
    }
    return (await response.json()) as Record<string, unknown>;
  }

  async list(): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.get(endpointMap.tenants.list);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getById(id: string): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.get(this.parseTenantPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async create(payload: Record<string, unknown>): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.post(endpointMap.tenants.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async update(id: string, payload: Record<string, unknown>): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.put(this.parseTenantPath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchById(id: string, payload: Record<string, unknown>): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.patch(this.parseTenantPath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async deleteById(id: string): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.delete(this.parseTenantPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async listWithoutAuth(): Promise<{ status: number; body: Record<string, unknown> }> {
    const response = await this.request.fetch(endpointMap.tenants.list, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async callRoute(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    route: string,
    payload?: Record<string, unknown>
  ): Promise<{ status: number; body: Record<string, unknown> }> {
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
