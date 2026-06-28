-- ── Story 1.5: Admin user (credentials via setup page or seed script) ──
CREATE TABLE IF NOT EXISTS admin_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Story 2.1: Page sections (static-page content) ──
CREATE TABLE IF NOT EXISTS page_section (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content_html TEXT DEFAULT '',
  cover_r2_key TEXT,
  cover_alt TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Story 3.1: Wisata ──
CREATE TABLE IF NOT EXISTS wisata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  deskripsi_html TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Story 4.1: UMKM ──
CREATE TABLE IF NOT EXISTS umkm (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  deskripsi_html TEXT DEFAULT '',
  lokasi TEXT,
  wa_number TEXT,
  telepon TEXT,
  google_maps_url TEXT,
  qris_r2_key TEXT,
  toko_online_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Story 6.1: Berita ──
CREATE TABLE IF NOT EXISTS berita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  judul TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  cover_media_id INTEGER,
  status TEXT DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Story 3.1: Media (shared by wisata/umkm/berita) ──
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key_display TEXT NOT NULL,
  r2_key_thumb TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT DEFAULT (datetime('now'))
);

-- ── Story 3.1: Polymorphic media links ──
CREATE TABLE IF NOT EXISTS media_link (
  media_id INTEGER NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  role TEXT DEFAULT 'gallery',
  sort INTEGER DEFAULT 0,
  PRIMARY KEY (media_id, owner_type, owner_id, role)
);

-- ── Story 5.1: Map pins ──
CREATE TABLE IF NOT EXISTS titik_peta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  jenis TEXT NOT NULL,
  linked_slug TEXT NOT NULL,
  label TEXT
);

-- ── Story 2.3: Village staff ──
CREATE TABLE IF NOT EXISTS perangkat_desa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  urutan INTEGER DEFAULT 0
);
