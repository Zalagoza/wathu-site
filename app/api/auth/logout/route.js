import { clearCookie } from '@/lib/auth';
import { ok } from '@/lib/util';
export async function POST() { clearCookie('wdc_session'); return ok({ ok: true }); }
