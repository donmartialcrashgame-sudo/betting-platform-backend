# Betting Platform Backend

Backend foundation for an original sportsbook platform with football data integration, custom odds, realtime WebSocket updates, wallet ledger, gifts and administration.

## Current foundation

- Node.js 20+
- TypeScript
- Express
- PostgreSQL + Prisma
- JWT authentication
- Google reCAPTCHA verification on registration and login
- Rate limiting and Helmet security headers
- WebSocket endpoint for realtime sports/odds infrastructure
- User roles
- Wallet ledger foundation
- Football sports/competition/event models
- Gift catalog and claim API
- Audit-log model

## reCAPTCHA

The frontend must obtain a Google reCAPTCHA token and send it as `recaptchaToken` on both registration and login. The backend verifies the token directly with Google. Never send `RECAPTCHA_SECRET_KEY` to the browser or commit it to Git.

The verification middleware accepts checkbox-style responses and score/action responses. For reCAPTCHA v3, the configured action and minimum score are checked.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Health endpoint: `GET /health`

Authentication: `POST /api/auth/register`, `POST /api/auth/login`

Gifts: `GET /api/gifts`, `GET /api/gifts/mine`, `POST /api/gifts/:giftId/claim`

Realtime: `ws://localhost:4000/ws`

## Architecture direction

The football provider is intentionally separated from the betting engine. A future provider adapter will ingest fixtures, live scores and match events into our own database. Our own odds engine will calculate and publish authoritative odds through the WebSocket layer. Provider odds do not need to be the source of truth.

Financial operations use integer minor units (`BigInt`) and immutable wallet transaction records. Real-money payment processing is not enabled in this initial foundation.

## Security

- Keep secrets in environment variables.
- Use HTTPS in production.
- Use a strong random `JWT_SECRET` of at least 32 characters.
- Configure CORS to the real frontend origin.
- Add KYC, responsible-gambling, payment-provider and jurisdiction controls before enabling real-money betting.
