import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  RECAPTCHA_SECRET_KEY: z.string().min(1),
  RECAPTCHA_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.5),
  RECAPTCHA_EXPECTED_ACTION: z.string().default('auth'),
  FOOTBALL_API_BASE_URL: z.string().url().optional().or(z.literal('')),
  FOOTBALL_API_KEY: z.string().optional(),
  WS_PATH: z.string().default('/ws')
});

export const env = schema.parse(process.env);
