import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hashPassword, createSession, generateSessionId, SESSION_COOKIE, SESSION_TTL } from '../../../lib/auth/session';

export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/login');

  // Only allow when no admin user exists
  const existing = await env.DB.prepare('SELECT id FROM admin_user LIMIT 1').first();
  if (existing) return redirect('/admin/login');

  const formData = await request.formData();
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password || password.length < 8) {
    return redirect('/admin/setup?error=Nama+pengguna+atau+kata+sandi+tidak+valid.');
  }

  const hash = await hashPassword(password);
  await env.DB.prepare('INSERT INTO admin_user (username, password_hash) VALUES (?, ?)')
    .bind(username, hash).run();

  const sessionId = generateSessionId();
  await createSession(sessionId, username, env.SESSION_KV);
  cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_TTL,
  });

  return redirect('/admin/dasbor');
};
