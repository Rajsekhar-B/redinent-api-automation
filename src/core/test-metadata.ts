import { test } from '@playwright/test';

export interface TestMetadata {
  requirementId: string;
  riskId: string;
  module: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export function addTestMetadata(metadata: TestMetadata): void {
  const info = test.info();
  info.annotations.push({ type: 'requirement', description: metadata.requirementId });
  info.annotations.push({ type: 'risk', description: metadata.riskId });
  info.annotations.push({ type: 'module', description: metadata.module });
  info.annotations.push({ type: 'severity', description: metadata.severity });
}
