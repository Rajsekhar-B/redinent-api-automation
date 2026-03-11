import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'qa', 'uat', 'prod-like']).default('qa'),
  CI: z.string().optional().transform((v) => v === 'true'),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  DEFAULT_USERNAME: z.string().min(1).default('qa.sdet@redinent.example.com'),
  DEFAULT_PASSWORD: z.string().min(1).default('replace_me'),
  DEFAULT_USER_EMAIL_HEADER: z.string().min(1).default('X-User-Email'),
  DEFAULT_USER_TOKEN_HEADER: z.string().min(1).default('X-User-Token'),
  CORE_API_KEY: z.string().optional(),
  SAMPLE_UID: z.string().default('sample-uid'),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  MAX_RETRY_COUNT: z.coerce.number().int().nonnegative().default(2)
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
