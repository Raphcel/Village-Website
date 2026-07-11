export interface Media {
  id: number;
  r2_key_display: string;
  r2_key_thumb: string;
  alt: string;
  uploaded_at: string;
}

export async function getMediaForEntity(
  ownerType: string,
  ownerId: number,
  db: D1Database
): Promise<Media[]> {
  const r = await db.prepare(
    `SELECT m.* FROM media m
     JOIN media_link ml ON ml.media_id = m.id
     WHERE ml.owner_type = ? AND ml.owner_id = ?
     ORDER BY ml.sort`
  ).bind(ownerType, ownerId).all<Media>();
  return r.results;
}

/** First photo (cover) per entity of a given type, keyed by owner_id. */
export async function getCoversForType(
  ownerType: string,
  db: D1Database
): Promise<Map<number, Media>> {
  const r = await db.prepare(
    `SELECT m.*, ml.owner_id FROM media m
     JOIN media_link ml ON ml.media_id = m.id
     WHERE ml.owner_type = ?
     ORDER BY ml.owner_id, ml.sort`
  ).bind(ownerType).all<Media & { owner_id: number }>();
  const covers = new Map<number, Media>();
  for (const m of r.results) if (!covers.has(m.owner_id)) covers.set(m.owner_id, m);
  return covers;
}

export const mediaUrl = (m: Media) =>
  `/api/media/${encodeURIComponent(m.r2_key_display)}`;

export async function linkMedia(
  mediaId: number,
  ownerType: string,
  ownerId: number,
  role: string,
  sort: number,
  db: D1Database
): Promise<void> {
  await db.prepare(
    'INSERT OR IGNORE INTO media_link (media_id, owner_type, owner_id, role, sort) VALUES (?, ?, ?, ?, ?)'
  ).bind(mediaId, ownerType, ownerId, role, sort).run();
}

export async function getAllMedia(db: D1Database): Promise<Media[]> {
  const r = await db.prepare('SELECT * FROM media ORDER BY uploaded_at DESC').all<Media>();
  return r.results;
}
