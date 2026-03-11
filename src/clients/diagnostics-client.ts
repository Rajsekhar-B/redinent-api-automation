import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class DiagnosticsClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private diagnosticsPath(id: string): string {
    return endpointMap.diagnostics.getById.replace(':id', encodeURIComponent(id));
  }

  private stopPath(id: string): string {
    return endpointMap.diagnostics.stopById.replace(':id', encodeURIComponent(id));
  }

  private metaPath(id: string): string {
    return endpointMap.diagnosticsMeta.getById.replace(':id', encodeURIComponent(id));
  }

  private metaRescanPath(id: string): string {
    return endpointMap.diagnosticsMeta.rescanById.replace(':id', encodeURIComponent(id));
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async list(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.diagnostics.list);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async listWithoutAuth(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.diagnostics.list, { method: 'GET' });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.diagnosticsPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async create(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.diagnostics.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(this.diagnosticsPath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async stopById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.stopPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async metaGetById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.metaPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async metaCreate(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.diagnosticsMeta.create, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async metaRescanById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.metaRescanPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }
}
