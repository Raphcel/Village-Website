import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { createUmkm } from '../../../../lib/db/umkm';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const nama = (fd.get('nama') as string)?.trim();
  const kategori = (fd.get('kategori') as string)?.trim();
  if (!nama || !kategori || !env) return redirect('/admin/umkm/new?error=1');

  const data = {
    nama, kategori,
    deskripsi_html: (fd.get('deskripsi_html') as string) ?? '',
    menu: (fd.get('menu') as string)?.trim() || null,
    jam_buka: (fd.get('jam_buka') as string)?.trim() || null,
    cara_pesan: (fd.get('cara_pesan') as string)?.trim() || null,
    lokasi: (fd.get('lokasi') as string) || null,
    wa_number: (fd.get('wa_number') as string) || null,
    telepon: (fd.get('telepon') as string) || null,
    google_maps_url: (fd.get('google_maps_url') as string) || null,
    qris_r2_key: null,
    toko_online_url: (fd.get('toko_online_url') as string) || null,
    status: (fd.get('status') as string) ?? 'draft',
  } as any;

  const { id } = await createUmkm(data, env.DB);
  await purgeCache(['/umkm', '/']);
  return redirect(`/admin/umkm/${id}?saved=1`);
};
