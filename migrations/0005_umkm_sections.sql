-- Section terstruktur untuk halaman UMKM: menu, jam buka, cara pesan.
-- Plain text (bukan HTML) — di-escape otomatis saat render.
ALTER TABLE umkm ADD COLUMN menu TEXT;
ALTER TABLE umkm ADD COLUMN jam_buka TEXT;
ALTER TABLE umkm ADD COLUMN cara_pesan TEXT;
