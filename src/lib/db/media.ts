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
