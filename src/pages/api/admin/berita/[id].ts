import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { updateBerita, getBeritaById } from '../../../../lib/db/berita';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, params, redirect }) => {
  const env = getEnv();
  const id = Number(params.id);
  const fd = await request.formData();
  const judul = (fd.get('judul') as string)?.trim();
  const content_html = (fd.get('content_html') as string) ?? '';
  const action = fd.get('_action') as string;
  const status = action === 'publish' ? 'published' : 'draft';

  if (!judul || !env) return redirect(`/admin/berita/${id}?error=1`);

  const existing = await getBeritaById(id, env.DB);
  await updateBerita(id, { judul, content_html, cover_media_id: existing?.cover_media_id ?? null, status }, env.DB);
  await purgeCache(['/berita', `/berita/${existing?.slug ?? ''}`, '/']);
  const qs = status === 'published' ? 'published=1' : 'saved=1';
  return redirect(`/admin/berita/${id}?${qs}`);
};
