import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { upsertSection } from '../../../lib/db/page-section';
import { purgeCache } from '../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/konten');

  const fd = await request.formData();
  const slug = fd.get('slug') as string;
  const title = (fd.get('title') as string)?.trim();
  const content_html = fd.get('content_html') as string;

  if (!slug || !title) return redirect(`/admin/konten/${slug}?error=1`);

  await upsertSection(slug, { title, content_html }, env.DB);

  // Purge relevant public cache paths
  const purgePaths = ['/', '/profil', '/potensi', '/pemerintahan'];
  await purgeCache(purgePaths);

  return redirect(`/admin/konten/${slug}?saved=1`);
};
