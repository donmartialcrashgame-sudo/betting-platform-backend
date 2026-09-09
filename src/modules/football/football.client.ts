import { getFootballApiKey, env } from '../../config/env';

export type FootballApiResponse<T> = {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[] | Record<string, unknown>;
  results: number;
  paging?: { current: number; total: number };
  response: T[];
};

export class FootballApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'FootballApiError';
  }
}

function hasApiErrors(errors: FootballApiResponse<unknown>['errors']): boolean {
  if (Array.isArray(errors)) return errors.length > 0;
  return Object.keys(errors ?? {}).length > 0;
}

export async function footballGet<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<FootballApiResponse<T>> {
  const apiKey = getFootballApiKey();
  if (!apiKey) {
    throw new FootballApiError('Football API key is not configured on the server.', 503);
  }

  const url = new URL(endpoint, `${env.FOOTBALL_API_BASE_URL.replace(/\/$/, '')}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        accept: 'application/json'
      },
      signal: controller.signal
    });

    const data = (await response.json()) as FootballApiResponse<T>;

    if (!response.ok) {
      throw new FootballApiError('Football provider request failed.', 502, data);
    }

    if (hasApiErrors(data.errors)) {
      throw new FootballApiError('Football provider returned an error.', 502, data.errors);
    }

    return data;
  } catch (error) {
    if (error instanceof FootballApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FootballApiError('Football provider request timed out.', 504);
    }
    throw new FootballApiError('Unable to reach the football provider.', 502);
  } finally {
    clearTimeout(timeout);
  }
}
