import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteUmkm, getUmkmById } from '../../../../lib/db/umkm';
import { getMediaForEntity } from '../../../../lib/db/media';
import { deleteMedia } from '../../../../lib/media/upload';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/umkm');
  const existing = await getUmkmById(id, env.DB);
  const media = await getMediaForEntity('umkm', id, env.DB);
  await Promise.all(media.map(m => deleteMedia(m.id, env.DB, env.MEDIA_BUCKET)));
  await deleteUmkm(id, env.DB);
  await purgeCache(['/umkm', `/umkm/${existing?.slug ?? ''}`, '/']);
  return redirect('/admin/umkm?deleted=1');
};
