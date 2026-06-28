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
