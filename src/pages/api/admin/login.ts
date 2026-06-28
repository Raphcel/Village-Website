import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { verifyPassword, createSession, generateSessionId, SESSION_COOKIE, SESSION_TTL } from '../../../lib/auth/session';

export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
  const formData = await request.formData();
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return redirect('/admin/login?error=1');
  }

  const env = getEnv();
  if (!env) {
    // Local dev without runtime — allow admin/admin for testing
    if (username === 'admin' && password === 'admin') {
      const sessionId = generateSessionId();
      cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: SESSION_TTL,
      });
      return redirect('/admin/dasbor');
    }
    return redirect('/admin/login?error=1');
  }

  const row = await env.DB.prepare('SELECT password_hash FROM admin_user WHERE username = ?')
    .bind(username).first<{ password_hash: string }>();

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return redirect('/admin/login?error=1');
  }

  const sessionId = generateSessionId();
  await createSession(sessionId, username, env.SESSION_KV);

  cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });

  return redirect('/admin/dasbor');
};
