import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { getWisataById, deleteWisata } from '../../../../lib/db/wisata';
import { getMediaForEntity } from '../../../../lib/db/media';
import { deleteMedia } from '../../../../lib/media/upload';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/wisata');

  const existing = await getWisataById(id, env.DB);
  const media = await getMediaForEntity('wisata', id, env.DB);
  await Promise.all(media.map(m => deleteMedia(m.id, env.DB, env.MEDIA_BUCKET)));
  await deleteWisata(id, env.DB);
  await purgeCache(['/wisata', `/wisata/${existing?.slug ?? ''}`, '/']);
  return redirect('/admin/wisata?deleted=1');
};
