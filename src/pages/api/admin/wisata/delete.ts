import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { getWisataById, deleteWisata } from '../../../../lib/db/wisata';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/wisata');

  const existing = await getWisataById(id, env.DB);
  await deleteWisata(id, env.DB);
  await purgeCache(['/wisata', `/wisata/${existing?.slug ?? ''}`, '/']);
  return redirect('/admin/wisata?deleted=1');
};
