import { getEnv } from '@lib/env';
import { defineMiddleware } from 'astro:middleware';
import { validateSession, SESSION_COOKIE } from './lib/auth/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isApiLogin = pathname === '/api/admin/login';
  const isSetupPage = pathname === '/admin/setup';

  if (isAdminRoute && !isLoginPage && !isSetupPage) {
    const sessionId = context.cookies.get(SESSION_COOKIE)?.value;
    const env = getEnv();

    if (!env) return next(); // local dev without runtime — allow through

    if (!sessionId) return context.redirect('/admin/login');

    const username = await validateSession(sessionId, env.SESSION_KV);
    if (!username) return context.redirect('/admin/login');

    context.locals.user = { username };
  }

  if (!isAdminRoute && !isApiLogin) {
    // no-op for public routes
  }

  return next();
});
