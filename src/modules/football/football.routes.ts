import { Router } from 'express';
import { z } from 'zod';
import { footballGet, FootballApiError } from './football.client';

const router = Router();

const fixtureQuery = z.object({
  date: z.string().optional(),
  league: z.coerce.number().int().positive().optional(),
  season: z.coerce.number().int().min(2000).max(2100).optional(),
  team: z.coerce.number().int().positive().optional(),
  timezone: z.string().optional()
});

function handleError(res: any, error: unknown) {
  if (error instanceof FootballApiError) {
    return res.status(error.statusCode).json({ ok: false, error: error.message, details: error.details });
  }
  console.error(error);
  return res.status(500).json({ ok: false, error: 'Football service error.' });
}

router.get('/status', async (_req, res) => {
  try {
    const data = await footballGet('/status');
    return res.json({ ok: true, provider: 'api-football', data });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/countries', async (_req, res) => {
  try {
    const data = await footballGet('/countries');
    return res.json({ ok: true, data: data.response, results: data.results });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/leagues', async (req, res) => {
  try {
    const data = await footballGet('/leagues', {
      country: typeof req.query.country === 'string' ? req.query.country : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      season: typeof req.query.season === 'string' ? req.query.season : undefined,
      current: typeof req.query.current === 'string' ? req.query.current : undefined
    });
    return res.json({ ok: true, data: data.response, results: data.results, paging: data.paging });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/fixtures', async (req, res) => {
  const parsed = fixtureQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });

  try {
    const data = await footballGet('/fixtures', parsed.data);
    return res.json({ ok: true, data: data.response, results: data.results, paging: data.paging });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/live', async (_req, res) => {
  try {
    const data = await footballGet('/fixtures', { live: 'all' });
    return res.json({ ok: true, data: data.response, results: data.results, paging: data.paging });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/fixture/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, error: 'Invalid fixture id.' });

  try {
    const data = await footballGet('/fixtures', { id });
    return res.json({ ok: true, data: data.response, results: data.results });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/standings', async (req, res) => {
  const league = Number(req.query.league);
  const season = Number(req.query.season);
  if (!Number.isInteger(league) || !Number.isInteger(season)) {
    return res.status(400).json({ ok: false, error: 'league and season are required.' });
  }

  try {
    const data = await footballGet('/standings', { league, season });
    return res.json({ ok: true, data: data.response, results: data.results });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/odds/:fixtureId', async (req, res) => {
  const fixture = Number(req.params.fixtureId);
  if (!Number.isInteger(fixture) || fixture <= 0) return res.status(400).json({ ok: false, error: 'Invalid fixture id.' });

  try {
    const data = await footballGet('/odds', { fixture });
    return res.json({ ok: true, data: data.response, results: data.results });
  } catch (error) {
    return handleError(res, error);
  }
});

router.get('/odds/live/:fixtureId', async (req, res) => {
  const fixture = Number(req.params.fixtureId);
  if (!Number.isInteger(fixture) || fixture <= 0) return res.status(400).json({ ok: false, error: 'Invalid fixture id.' });

  try {
    const data = await footballGet('/odds/live', { fixture });
    return res.json({ ok: true, data: data.response, results: data.results });
  } catch (error) {
    return handleError(res, error);
  }
});

export default router;
