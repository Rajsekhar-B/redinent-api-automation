import { z } from 'zod';

export function validateSchema<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  return schema.parse(payload);
}
