import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const key = params.key as string;
  const env = getEnv();

  if (!env || !key) return new Response('Not found', { status: 404 });

  const obj = await env.MEDIA_BUCKET.get(decodeURIComponent(key));
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType ?? 'image/webp');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(obj.body, { headers });
};
