export interface PerangkatDesa {
  id: number;
  nama: string;
  jabatan: string;
  urutan: number;
}

export async function getPerangkatDesa(db: D1Database): Promise<PerangkatDesa[]> {
  const r = await db.prepare('SELECT * FROM perangkat_desa ORDER BY urutan').all<PerangkatDesa>();
  return r.results;
}

export async function upsertPerangkat(
  data: { id?: number; nama: string; jabatan: string; urutan: number },
  db: D1Database
): Promise<void> {
  if (data.id) {
    await db.prepare('UPDATE perangkat_desa SET nama = ?, jabatan = ?, urutan = ? WHERE id = ?')
      .bind(data.nama, data.jabatan, data.urutan, data.id).run();
  } else {
    await db.prepare('INSERT INTO perangkat_desa (nama, jabatan, urutan) VALUES (?, ?, ?)')
      .bind(data.nama, data.jabatan, data.urutan).run();
  }
}

export async function deletePerangkat(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM perangkat_desa WHERE id = ?').bind(id).run();
}
