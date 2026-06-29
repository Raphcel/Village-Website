// Penulis: Rafif Muhammad Farras (KKN-T Inovasi IPB University 2026 — Desa Loji)
//
// Endpoint unggah media admin. Menerima dua blob WebP (display + thumb) yang sudah
// di-resize di browser (lihat src/lib/media/client-upload.ts) lalu menyimpannya ke R2 + D1.
// Rute /api/admin/* otomatis dijaga sesi login oleh src/middleware.ts.

import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { saveMedia } from '../../../../lib/media/upload';

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB per file (display sudah diciutkan di klien)

// Validasi batas-kepercayaan: hanya WebP berukuran wajar yang boleh masuk.
// Diekspor agar bisa diuji tanpa runtime — lihat blok self-check di bawah.
export function validateUpload(
  display: unknown,
  thumb: unknown,
): { ok: true } | { ok: false; error: string } {
  if (!(display instanceof Blob) || !(thumb instanceof Blob)) {
    return { ok: false, error: 'File gambar tidak lengkap.' };
  }
  if (display.type !== 'image/webp' || thumb.type !== 'image/webp') {
    return { ok: false, error: 'Format gambar tidak didukung.' };
  }
  if (display.size > MAX_BYTES || thumb.size > MAX_BYTES) {
    return { ok: false, error: 'Ukuran gambar terlalu besar.' };
  }
  return { ok: true };
}

export const POST: APIRoute = async ({ request }) => {
  const env = getEnv();
  if (!env) return new Response(JSON.stringify({ error: 'Runtime tidak tersedia.' }), { status: 503 });

  const fd = await request.formData();
  const display = fd.get('display');
  const thumb = fd.get('thumb');
  const alt = ((fd.get('alt') as string) ?? '').trim();

  const check = validateUpload(display, thumb);
  if (!check.ok) return new Response(JSON.stringify({ error: check.error }), { status: 400 });

  const result = await saveMedia(display as Blob, thumb as Blob, alt, env.DB, env.MEDIA_BUCKET);
  return new Response(
    JSON.stringify({
      id: result.id,
      displayKey: result.displayKey,
      url: `/api/media/${encodeURIComponent(result.displayKey)}`,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
