import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { updateWisata, getWisataById } from '../../../../lib/db/wisata';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, params, redirect }) => {
  const env = getEnv();
  const id = Number(params.id);
  const fd = await request.formData();
  const nama = (fd.get('nama') as string)?.trim();
  const deskripsi_html = (fd.get('deskripsi_html') as string) ?? '';
  const status = (fd.get('status') as string) ?? 'draft';

  if (!nama || !env) return redirect(`/admin/wisata/${id}?error=1`);

  const existing = await getWisataById(id, env.DB);
  await updateWisata(id, { nama, deskripsi_html, status }, env.DB);
  await purgeCache(['/wisata', `/wisata/${existing?.slug ?? ''}`, '/']);
  return redirect(`/admin/wisata/${id}?saved=1`);
};
