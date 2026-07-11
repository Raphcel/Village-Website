import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteMedia } from '../../../../lib/media/upload';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const back = (fd.get('back') as string) || '/admin/media';
  if (!env) return redirect(back);

  const action = fd.get('_action') as string;
  const mediaId = Number(fd.get('media_id'));
  const ownerType = fd.get('owner_type') as string | null;
  const ownerId = Number(fd.get('owner_id'));

  if (Number.isFinite(mediaId)) {
    if (action === 'delete') {
      await deleteMedia(mediaId, env.DB, env.MEDIA_BUCKET);
    } else if (action === 'cover' && ownerType && Number.isFinite(ownerId)) {
      await env.DB.prepare(`
        UPDATE media_link
        SET sort = (SELECT COALESCE(MIN(sort), 0) - 1 FROM media_link WHERE owner_type = ? AND owner_id = ?)
        WHERE media_id = ? AND owner_type = ? AND owner_id = ?
      `).bind(ownerType, ownerId, mediaId, ownerType, ownerId).run();
    }
  }

  const purge = (fd.get('purge') as string) ?? '';
  if (purge) await purgeCache(purge.split(',').map(p => p.trim()).filter(Boolean));

  return redirect(back);
};
