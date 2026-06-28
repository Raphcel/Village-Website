import { getEnv } from '@lib/env';
import { defineMiddleware } from 'astro:middleware';
import { validateSession, SESSION_COOKIE } from './lib/auth/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  // Public auth endpoints — must stay reachable WITHOUT an existing session.
  // (setup self-guards: it only works while no admin user exists.)
  const isLoginPage = pathname === '/admin/login';
  const isSetupPage = pathname === '/admin/setup';
  const isApiLogin = pathname === '/api/admin/login';
  const isApiSetup = pathname === '/api/admin/setup';

  const needsAuth =
    (isAdminPage && !isLoginPage && !isSetupPage) ||
    (isAdminApi && !isApiLogin && !isApiSetup);

  if (needsAuth) {
    const env = getEnv();

    if (!env) return next(); // local dev without runtime — allow through

    const sessionId = context.cookies.get(SESSION_COOKIE)?.value;
    const username = sessionId ? await validateSession(sessionId, env.SESSION_KV) : null;

    if (!username) {
      // API callers get a 401; page navigations get redirected to login.
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }

    context.locals.user = { username };
  }

  return next();
});
