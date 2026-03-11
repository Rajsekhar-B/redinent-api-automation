import { expect } from '@playwright/test';

export function expectApiErrorShape(payload: unknown): void {
  expect(payload).toEqual(
    expect.objectContaining({
      errorCode: expect.any(String),
      message: expect.any(String),
      correlationId: expect.any(String)
    })
  );
}

export function expectStatusIn(status: number, accepted: number[]): void {
  expect(accepted).toContain(status);
}
