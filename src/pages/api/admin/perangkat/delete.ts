import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deletePerangkat } from '../../../../lib/db/perangkat-desa';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const id = Number(fd.get('id'));
  if (!env || !id) return redirect('/admin/perangkat');
  await deletePerangkat(id, env.DB);
  await purgeCache(['/pemerintahan']);
  return redirect('/admin/perangkat?deleted=1');
};
