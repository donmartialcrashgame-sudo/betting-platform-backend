import 'dotenv/config';
import { z } from 'zod';

// All configuration values have safe development fallbacks so the API can boot
// without requiring a large set of Render environment variables. Production
// deployments should still provide real secrets and service URLs.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/postgres'),
  JWT_SECRET: z.string().min(32).default('development-only-jwt-secret-change-this-before-production-123456'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  RECAPTCHA_SECRET_KEY: z.string().min(1).default('development-recaptcha-secret'),
  RECAPTCHA_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.5),
  RECAPTCHA_EXPECTED_ACTION: z.string().default('auth'),
  API_SPORTS_KEY: z.string().optional(),
  FOOTBALL_API_KEY: z.string().optional(),
  FOOTBALL_API_BASE_URL: z.string().url().default('https://v3.football.api-sports.io'),
  WS_PATH: z.string().default('/ws')
});

export const env = schema.parse(process.env);

export function getFootballApiKey(): string | undefined {
  return env.API_SPORTS_KEY || env.FOOTBALL_API_KEY;
}
