import { sleep } from '../core/retry';

export async function pollUntil<T>(
  operation: () => Promise<T>,
  condition: (value: T) => boolean,
  timeoutMs = 60_000,
  intervalMs = 3_000
): Promise<T> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const result = await operation();
    if (condition(result)) {
      return result;
    }
    await sleep(intervalMs);
  }

  throw new Error(`Polling timed out after ${timeoutMs}ms`);
}
