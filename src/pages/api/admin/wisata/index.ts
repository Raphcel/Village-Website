import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { createWisata } from '../../../../lib/db/wisata';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const nama = (fd.get('nama') as string)?.trim();
  const deskripsi_html = (fd.get('deskripsi_html') as string) ?? '';
  const status = (fd.get('status') as string) ?? 'draft';

  if (!nama) return redirect('/admin/wisata/new?error=1');

  const db = env?.DB;
  if (!db) return redirect('/admin/wisata');

  const { id } = await createWisata({ nama, deskripsi_html, status }, db);
  await purgeCache(['/wisata', '/']);
  return redirect(`/admin/wisata/${id}?saved=1`);
};
