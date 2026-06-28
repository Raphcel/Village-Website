import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteUmkm, getUmkmById } from '../../../../lib/db/umkm';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/umkm');
  const existing = await getUmkmById(id, env.DB);
  await deleteUmkm(id, env.DB);
  await purgeCache(['/umkm', `/umkm/${existing?.slug ?? ''}`, '/']);
  return redirect('/admin/umkm?deleted=1');
};
