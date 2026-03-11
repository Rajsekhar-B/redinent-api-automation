import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api-client';
import { TokenManager } from '../auth/token-manager';
import { endpointMap } from '../config/endpoints';

type JsonLike = Record<string, unknown>;

export class OtherClient extends BaseApiClient {
  constructor(request: APIRequestContext, tokenManager: TokenManager) {
    super(request, tokenManager);
  }

  private async parseBody(response: { json: () => Promise<unknown>; headers: () => Record<string, string> }): Promise<JsonLike> {
    const contentType = response.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return {};
    return (await response.json()) as JsonLike;
  }

  async patchPassword(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(endpointMap.other.password, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async postPassword(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.other.password, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async putPassword(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.put(endpointMap.other.password, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchUpdate(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(endpointMap.other.update, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async deleteDestroy(): Promise<{ status: number; body: JsonLike }> {
    const response = await this.delete(endpointMap.other.destroy);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getPage(
    key:
      | 'passwordEdit'
      | 'passwordNew'
      | 'edit'
      | 'reports'
      | 'reportsExport'
      | 'reportsDetail'
      | 'reportsDetailedStatus'
      | 'reportsExportAlerts'
      | 'reportsExportAlertsFileStatus'
      | 'reportsGenIsoReport'
      | 'reportsGenReport'
      | 'reportsHostprofile'
      | 'reportsMasterResults'
      | 'reportsNew'
  ): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(endpointMap.other[key]);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async postSaveEvidence(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.other.reportsSaveEvidence, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  private reportByIdPath(id: string): string {
    return endpointMap.other.reportsById.replace(':id', id);
  }

  private reportEditByIdPath(id: string): string {
    return endpointMap.other.reportsEditById.replace(':id', id);
  }

  async createReport(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.post(endpointMap.other.reports, payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async createReportWithoutAuth(payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.request.fetch(endpointMap.other.reports, {
      method: 'POST',
      data: payload
    });
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getReportById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.reportByIdPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async patchReportById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.patch(this.reportByIdPath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async putReportById(id: string, payload: JsonLike): Promise<{ status: number; body: JsonLike }> {
    const response = await this.put(this.reportByIdPath(id), payload);
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async deleteReportById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.delete(this.reportByIdPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }

  async getReportEditById(id: string): Promise<{ status: number; body: JsonLike }> {
    const response = await this.get(this.reportEditByIdPath(id));
    return { status: response.status(), body: await this.parseBody(response) };
  }
}
