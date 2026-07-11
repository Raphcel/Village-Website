export async function getPengaturan(db: D1Database): Promise<Record<string, string>> {
  const r = await db.prepare('SELECT key, value FROM pengaturan').all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  for (const row of r.results) out[row.key] = row.value;
  return out;
}

export async function setPengaturan(entries: Record<string, string>, db: D1Database): Promise<void> {
  const stmts = Object.entries(entries).map(([key, value]) =>
    db.prepare(`
      INSERT INTO pengaturan (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).bind(key, value)
  );
  await db.batch(stmts);
}
