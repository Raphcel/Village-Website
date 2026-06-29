// Penulis: Rafif Muhammad Farras (KKN-T Inovasi IPB University 2026 — Desa Loji)
//
// Resize gambar di browser pakai <canvas> lalu unggah dua versi WebP (display + thumb)
// ke /api/admin/media. Dipakai bersama oleh editor berita dan halaman Perpustakaan Media.
// Tidak butuh library image-processing server (Cloudflare Workers tak bisa jalankan sharp).

const MAX_DISPLAY = 1600; // lebar maks gambar tampil
const MAX_THUMB = 480; // lebar maks thumbnail

export interface UploadedImage {
  id: number;
  url: string; // /api/media/<key> siap dipakai di <img src>
  alt: string;
}

async function resizeToWebp(bitmap: ImageBitmap, maxWidth: number): Promise<Blob> {
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Gagal mengubah gambar ke WebP'))),
      'image/webp',
      0.82,
    ),
  );
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) throw new Error('File yang dipilih bukan gambar.');

  const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Gambar';
  const bitmap = await createImageBitmap(file);
  try {
    const [display, thumb] = await Promise.all([
      resizeToWebp(bitmap, MAX_DISPLAY),
      resizeToWebp(bitmap, MAX_THUMB),
    ]);

    const fd = new FormData();
    fd.append('display', display, 'display.webp');
    fd.append('thumb', thumb, 'thumb.webp');
    fd.append('alt', alt);

    const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Unggah gagal (${res.status}). ${msg}`.trim());
    }
    const data = (await res.json()) as { id: number; url: string };
    return { id: data.id, url: data.url, alt };
  } finally {
    bitmap.close();
  }
}
