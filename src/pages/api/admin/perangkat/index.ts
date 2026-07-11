import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { upsertPerangkat } from '../../../../lib/db/perangkat-desa';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const idRaw = fd.get('id') as string | null;
  const nama = (fd.get('nama') as string)?.trim();
  const jabatan = (fd.get('jabatan') as string)?.trim();
  const urutan = Number(fd.get('urutan')) || 0;

  if (!env || !nama || !jabatan) return redirect('/admin/perangkat?error=1');

  await upsertPerangkat({ id: idRaw ? Number(idRaw) : undefined, nama, jabatan, urutan }, env.DB);
  await purgeCache(['/pemerintahan']);
  return redirect('/admin/perangkat?saved=1');
};
