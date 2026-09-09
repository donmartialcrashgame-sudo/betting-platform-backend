import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(req: Request, res: Response, next: NextFunction) {
  const token = req.body?.recaptchaToken;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ ok: false, error: 'reCAPTCHA verification is required.' });
  }

  try {
    const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: 'Unable to verify reCAPTCHA.' });
    }

    const result = (await response.json()) as RecaptchaResponse;
    const isV3 = typeof result.score === 'number';
    const actionOk = !isV3 || result.action === env.RECAPTCHA_EXPECTED_ACTION;
    const scoreOk = !isV3 || result.score! >= env.RECAPTCHA_MIN_SCORE;

    if (!result.success || !actionOk || !scoreOk) {
      return res.status(403).json({ ok: false, error: 'reCAPTCHA verification failed.' });
    }

    next();
  } catch {
    return res.status(502).json({ ok: false, error: 'Unable to verify reCAPTCHA.' });
  }
}
