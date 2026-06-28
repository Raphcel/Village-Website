export interface Wisata {
  id: number;
  slug: string;
  nama: string;
  deskripsi_html: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export async function getPublishedWisata(db: D1Database): Promise<Wisata[]> {
  const r = await db.prepare("SELECT * FROM wisata WHERE status='published' ORDER BY nama").all<Wisata>();
  return r.results;
}

export async function getWisataBySlug(slug: string, db: D1Database): Promise<Wisata | null> {
  return db.prepare("SELECT * FROM wisata WHERE slug = ? AND status = 'published'").bind(slug).first<Wisata>();
}

export async function getAllWisata(db: D1Database): Promise<Wisata[]> {
  const r = await db.prepare('SELECT * FROM wisata ORDER BY updated_at DESC').all<Wisata>();
  return r.results;
}

export async function getWisataById(id: number, db: D1Database): Promise<Wisata | null> {
  return db.prepare('SELECT * FROM wisata WHERE id = ?').bind(id).first<Wisata>();
}

export function toSlug(nama: string): string {
  return nama.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createWisata(
  data: { nama: string; deskripsi_html: string; status: string },
  db: D1Database
): Promise<{ id: number; slug: string }> {
  const baseSlug = toSlug(data.nama);
  let slug = baseSlug;
  let i = 1;
  while (await db.prepare('SELECT id FROM wisata WHERE slug = ?').bind(slug).first()) {
    slug = `${baseSlug}-${i++}`;
  }
  const r = await db.prepare(
    "INSERT INTO wisata (slug, nama, deskripsi_html, status) VALUES (?, ?, ?, ?) RETURNING id"
  ).bind(slug, data.nama, data.deskripsi_html, data.status).first<{ id: number }>();
  return { id: r!.id, slug };
}

export async function updateWisata(
  id: number,
  data: { nama: string; deskripsi_html: string; status: string },
  db: D1Database
): Promise<void> {
  await db.prepare(
    "UPDATE wisata SET nama=?, deskripsi_html=?, status=?, updated_at=datetime('now') WHERE id=?"
  ).bind(data.nama, data.deskripsi_html, data.status, id).run();
}

export async function deleteWisata(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM media_link WHERE owner_type=? AND owner_id=?').bind('wisata', id).run();
  await db.prepare('DELETE FROM wisata WHERE id=?').bind(id).run();
}
