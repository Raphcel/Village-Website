export interface UploadResult {
  displayKey: string;
  thumbKey: string;
  id: number;
}

export async function saveMedia(
  displayBlob: Blob,
  thumbBlob: Blob,
  alt: string,
  db: D1Database,
  bucket: R2Bucket
): Promise<UploadResult> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const displayKey = `media/${ts}-${rand}-display.webp`;
  const thumbKey = `media/${ts}-${rand}-thumb.webp`;

  await Promise.all([
    bucket.put(displayKey, await displayBlob.arrayBuffer(), { httpMetadata: { contentType: 'image/webp' } }),
    bucket.put(thumbKey, await thumbBlob.arrayBuffer(), { httpMetadata: { contentType: 'image/webp' } }),
  ]);

  const result = await db
    .prepare('INSERT INTO media (r2_key_display, r2_key_thumb, alt) VALUES (?, ?, ?) RETURNING id')
    .bind(displayKey, thumbKey, alt)
    .first<{ id: number }>();

  return { displayKey, thumbKey, id: result!.id };
}

export async function getMediaUrl(key: string, bucket: R2Bucket): Promise<string | null> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  // Return a signed or public URL. For now, return the R2 public URL pattern
  // In production this would use a custom domain or R2 public access
  return `/api/media/${encodeURIComponent(key)}`;
}

export async function deleteMedia(
  mediaId: number,
  db: D1Database,
  bucket: R2Bucket
): Promise<void> {
  const row = await db
    .prepare('SELECT r2_key_display, r2_key_thumb FROM media WHERE id = ?')
    .bind(mediaId)
    .first<{ r2_key_display: string; r2_key_thumb: string }>();
  if (!row) return;

  await Promise.all([
    bucket.delete(row.r2_key_display),
    bucket.delete(row.r2_key_thumb),
  ]);

  await db.prepare('DELETE FROM media_link WHERE media_id = ?').bind(mediaId).run();
  await db.prepare('DELETE FROM media WHERE id = ?').bind(mediaId).run();
}
