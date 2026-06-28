import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteTitikPeta } from '../../../../lib/db/titik-peta';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/peta');
  await deleteTitikPeta(id, env.DB);
  await purgeCache(['/peta', '/']);
  return redirect('/admin/peta?deleted=1');
};
