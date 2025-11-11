// app/lib/ratelimit.ts
// Límite simple en memoria: 60 req / 60 s por IP (solo APIs).
// En Vercel funciona porque globalThis sobrevive entre invocaciones en el mismo edge/region.

type Bucket = { count: number; resetAt: number };
const WINDOW_MS = 60_000;
const MAX = 60;

const store: Map<string, Bucket> = (globalThis as any).__rlstore ?? new Map();
(globalThis as any).__rlstore = store;

export function checkRateLimit(req: Request) {
  // IP real si existe, si no, usa el header estándar o fallback
  const ip =
    (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) ||
    (req.headers.get('x-real-ip')) ||
    'unknown';

  const now = Date.now();
  const key = `ip:${ip}`;
  const b = store.get(key);

  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX - 1, resetAt: now + WINDOW_MS };
  }

  if (b.count >= MAX) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }

  b.count += 1;
  return { ok: true, remaining: MAX - b.count, resetAt: b.resetAt };
}