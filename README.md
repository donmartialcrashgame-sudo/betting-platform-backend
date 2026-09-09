# betting-platform-backend

Backend foundation for an original football-first sportsbook platform. We are building football first and adding the remaining sportsbook features one by one.

## Football-first roadmap

### 1. Football data

- [x] API-Sports / API-Football server-side connection
- [x] Football provider configuration
- [x] Provider status endpoint
- [x] Countries endpoint
- [x] Leagues endpoint
- [x] Fixtures endpoint
- [x] Live fixtures endpoint
- [x] Single fixture endpoint
- [x] Standings endpoint
- [x] Pre-match provider odds endpoint
- [x] Live provider odds endpoint
- [ ] Persist provider football data into our own database
- [ ] Automatic fixture synchronization worker
- [ ] Automatic live-match synchronization worker

### 2. Football competitions

- [ ] Seed and manage supported football competitions in our database
- [ ] Link provider league IDs to our competitions
- [ ] Manage active/inactive competitions
- [ ] Competition filtering for the sportsbook

### 3. Our football database

- [x] Sport model
- [x] Competition model
- [x] Event/match model
- [x] Match score/status fields
- [ ] Provider-to-database mapping
- [ ] Team model with provider IDs and logos
- [ ] Player model
- [ ] Match statistics storage
- [ ] Match events storage (goals, cards, substitutions, etc.)

### 4. Betting markets

- [ ] Match Winner (1X2)
- [ ] Double Chance
- [ ] Draw No Bet
- [ ] Over/Under
- [ ] Both Teams To Score
- [ ] Correct Score
- [ ] Half Time / Full Time
- [ ] Corners markets
- [ ] Cards markets
- [ ] Market suspension rules

### 5. Our own odds engine

- [ ] Internal odds model
- [ ] Automatic odds calculation
- [ ] Odds updates
- [ ] Odds history
- [ ] AUTO / MANUAL / SUSPEND market controls
- [ ] Trader/admin odds overrides
- [ ] Live odds calculation from match state

### 6. Live football

- [x] WebSocket server foundation
- [ ] Live match processor
- [ ] Live score updates
- [ ] Match minute updates
- [ ] Goal events
- [ ] Card events
- [ ] Substitution events
- [ ] Live match statistics
- [ ] Live market updates through WebSocket

### 7. Football API for the frontend

The browser must call our backend rather than exposing the API-Sports key.

- [x] `GET /api/football/status`
- [x] `GET /api/football/countries`
- [x] `GET /api/football/leagues`
- [x] `GET /api/football/fixtures`
- [x] `GET /api/football/live`
- [x] `GET /api/football/fixture/:id`
- [x] `GET /api/football/standings?league=39&season=2025`
- [x] `GET /api/football/odds/:fixtureId`
- [x] `GET /api/football/odds/live/:fixtureId`

## Current focus

**FOOTBALL ONLY.**

The next implementation phase is to make the football provider data become our own reliable football data layer: synchronize leagues, teams and fixtures into PostgreSQL, then build our own football markets and odds on top of that data.

Wallets, deposits, withdrawals, gifts, KYC, promotions and other sportsbook features are intentionally not part of the current implementation phase.

## API-Sports / API-Football integration

The backend keeps the API-Sports key server-side. Browsers call our `/api/football/*` endpoints; they never receive the provider key.

Environment variables:

```env
API_SPORTS_KEY=your-key
FOOTBALL_API_BASE_URL=https://v3.football.api-sports.io
```

Do not commit the real key to GitHub. For Render, add `API_SPORTS_KEY` in the service's Environment Variables and redeploy.

The football provider is a data source only. Our sportsbook will eventually own its own football data, markets, odds calculation, betslips, bets and settlement logic.

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
