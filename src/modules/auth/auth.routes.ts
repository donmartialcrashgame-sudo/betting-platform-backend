import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { env } from '../../config/env';
import { verifyRecaptcha } from '../../middleware/recaptcha';

const router = Router();
const registerSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  phone: z.string().min(7).max(30).optional(),
  password: z.string().min(10).max(128),
  ageConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
  recaptchaToken: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1),
  recaptchaToken: z.string().min(1)
});

function signToken(userId: string, roles: string[]) {
  return jwt.sign({ roles }, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

router.post('/register', verifyRecaptcha, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });

  const { email, phone, password } = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] } });
  if (existing) return res.status(409).json({ ok: false, error: 'Account already exists.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const userRole = await prisma.role.upsert({ where: { name: 'USER' }, update: {}, create: { name: 'USER' } });
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      ageConfirmedAt: new Date(),
      roles: { create: { roleId: userRole.id } },
      wallet: { create: { currency: 'NGN' } }
    },
    include: { roles: { include: { role: true } } }
  });

  const token = signToken(user.id, user.roles.map((r) => r.role.name));
  return res.status(201).json({ ok: true, user: { id: user.id, email: user.email }, token });
});

router.post('/login', verifyRecaptcha, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'Invalid login data.' });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, include: { roles: { include: { role: true } } } });
  if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
  }

  const roles = user.roles.map((r) => r.role.name);
  return res.json({ ok: true, user: { id: user.id, email: user.email }, token: signToken(user.id, roles) });
});

export default router;
