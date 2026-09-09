# betting-platform-backend

Backend foundation for an original sportsbook platform with live football, custom odds, wallets and gifts.

## Stack

- Node.js 20+
- TypeScript + Express
- PostgreSQL + Prisma
- JWT authentication
- Google reCAPTCHA verification on public registration/login only
- WebSocket realtime channel
- API-Sports / API-Football server-side integration

## API-Football integration

The backend keeps the API-Sports key server-side. Browsers call our `/api/football/*` endpoints; they never receive the provider key.

Environment variables:

```env
API_SPORTS_KEY=your-key
FOOTBALL_API_BASE_URL=https://v3.football.api-sports.io
```

Do not commit the real key to GitHub. For Render, add `API_SPORTS_KEY` in the service's Environment Variables and redeploy.

Available endpoints:

- `GET /api/football/status`
- `GET /api/football/countries`
- `GET /api/football/leagues`
- `GET /api/football/fixtures`
- `GET /api/football/live`
- `GET /api/football/fixture/:id`
- `GET /api/football/standings?league=39&season=2025`
- `GET /api/football/odds/:fixtureId`
- `GET /api/football/odds/live/:fixtureId`

The football provider is a data source only. Our sportsbook will own its own markets, odds calculation, betslips, bets and settlement logic.

## reCAPTCHA

The backend expects `recaptchaToken` on registration and login. The reCAPTCHA widget/token should be rendered only on those public authentication pages in the frontend. It is not required on the authenticated dashboard or normal sportsbook pages.

Keep `RECAPTCHA_SECRET_KEY` server-side. The frontend should use Google's public site key to obtain the token and send that token to `/api/auth/register` or `/api/auth/login`.

## Run locally

```bash
npm install
npm run prisma:generate
npm run build
npm start
```

Copy `.env.example` to `.env` and fill in the required values.
