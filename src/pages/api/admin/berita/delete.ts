import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteBerita, getBeritaById } from '../../../../lib/db/berita';
import { getMediaForEntity } from '../../../../lib/db/media';
import { deleteMedia } from '../../../../lib/media/upload';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/berita');
  const existing = await getBeritaById(id, env.DB);
  const media = await getMediaForEntity('berita', id, env.DB);
  await Promise.all(media.map(m => deleteMedia(m.id, env.DB, env.MEDIA_BUCKET)));
  await deleteBerita(id, env.DB);
  await purgeCache(['/berita', `/berita/${existing?.slug ?? ''}`, '/']);
  return redirect('/admin/berita?deleted=1');
};
