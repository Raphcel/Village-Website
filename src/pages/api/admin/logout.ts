import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteSession, SESSION_COOKIE } from '../../../lib/auth/session';

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  const sessionId = cookies.get(SESSION_COOKIE)?.value;
  const env = getEnv();

  if (sessionId && env) {
    await deleteSession(sessionId, env.SESSION_KV);
  }

  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/admin/login');
};
