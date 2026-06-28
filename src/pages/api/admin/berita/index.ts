import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { createBerita } from '../../../../lib/db/berita';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const judul = (fd.get('judul') as string)?.trim();
  const content_html = (fd.get('content_html') as string) ?? '';
  const action = fd.get('_action') as string;
  const status = action === 'publish' ? 'published' : 'draft';

  if (status === 'published' && (!judul || !content_html.replace(/<[^>]*>/g,'').trim())) {
    return redirect('/admin/berita/new?errors=Judul+belum+diisi.,Isi+belum+diisi.');
  }
  if (!judul || !env) return redirect('/admin/berita/new?errors=Judul+belum+diisi.');

  const { id, slug } = await createBerita({ judul, content_html, cover_media_id: null, status }, env.DB);
  await purgeCache(['/berita', `/berita/${slug}`, '/']);
  const qs = status === 'published' ? 'published=1' : 'saved=1';
  return redirect(`/admin/berita/${id}?${qs}`);
};
