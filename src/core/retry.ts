export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number,
  retryable: (error: unknown) => boolean,
  baseDelayMs = 250
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries || !retryable(error)) {
        throw error;
      }
      const delay = baseDelayMs * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw new Error('Retry execution reached an unexpected terminal state');
}
