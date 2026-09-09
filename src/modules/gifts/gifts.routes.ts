import { Router } from 'express';
import { prisma } from '../../database/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', async (_req, res) => {
  const gifts = await prisma.gift.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
  res.json({ ok: true, gifts });
});

router.get('/mine', authenticate, async (req: AuthRequest, res) => {
  const claims = await prisma.giftClaim.findMany({ where: { userId: req.user!.id }, include: { gift: true }, orderBy: { createdAt: 'desc' } });
  res.json({ ok: true, claims });
});

router.post('/:giftId/claim', authenticate, async (req: AuthRequest, res) => {
  const gift = await prisma.gift.findUnique({ where: { id: req.params.giftId } });
  if (!gift || gift.status !== 'ACTIVE') return res.status(404).json({ ok: false, error: 'Gift is unavailable.' });
  if (gift.endsAt && gift.endsAt < new Date()) return res.status(400).json({ ok: false, error: 'Gift has expired.' });
  if (gift.stock !== null && gift.stock <= 0) return res.status(409).json({ ok: false, error: 'Gift is out of stock.' });

  try {
    const claim = await prisma.$transaction(async (tx) => {
      const existing = await tx.giftClaim.findUnique({ where: { giftId_userId: { giftId: gift.id, userId: req.user!.id } } });
      if (existing) throw new Error('ALREADY_CLAIMED');
      if (gift.stock !== null) {
        const updated = await tx.gift.updateMany({ where: { id: gift.id, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } });
        if (updated.count !== 1) throw new Error('OUT_OF_STOCK');
      }
      return tx.giftClaim.create({ data: { giftId: gift.id, userId: req.user!.id, reference: `GIFT-${randomUUID()}`, status: 'PENDING' } });
    });
    res.status(201).json({ ok: true, claim });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'ALREADY_CLAIMED') return res.status(409).json({ ok: false, error: 'Gift already claimed.' });
    if (message === 'OUT_OF_STOCK') return res.status(409).json({ ok: false, error: 'Gift is out of stock.' });
    throw error;
  }
});

export default router;
