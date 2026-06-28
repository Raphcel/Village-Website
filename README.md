# Website Desa Loji

Website resmi Desa Loji — dibangun sebagai bagian dari program **KKN-T Inovasi IPB University 2026** di Desa Loji, Kabupaten Sukabumi. Situs ini menampilkan profil desa, potensi (pertanian, perikanan, pariwisata), direktori UMKM, peta interaktif, dan berita desa, lengkap dengan panel admin agar perangkat desa dapat mengelola konten sendiri tanpa bantuan teknis.

## Tumpukan Teknologi (Tech Stack)

| Lapisan | Teknologi |
|---------|-----------|
| Framework | [Astro 7](https://astro.build) (mode `server` / SSR) |
| Hosting & Runtime | [Cloudflare Workers](https://workers.cloudflare.com) (via `@astrojs/cloudflare`) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| Penyimpanan media | [Cloudflare R2](https://developers.cloudflare.com/r2/) (objek/gambar) |
| Sesi login | [Cloudflare KV](https://developers.cloudflare.com/kv/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Peta | [Leaflet](https://leafletjs.com) |
| Komponen interaktif | React 19 |

Pilihan ini menjaga biaya operasional tetap rendah (target ~Rp300 ribu/tahun) dengan memanfaatkan tier gratis Cloudflare.

## Struktur Proyek

```
src/
├── components/      Komponen UI (Layout, Nav, Footer, Button, Card, dll.)
├── lib/
│   ├── auth/        Hashing kata sandi (PBKDF2) & sesi KV
│   ├── db/          Akses data D1 per entitas (wisata, umkm, berita, dll.)
│   ├── cache/       Purge cache halaman publik
│   ├── media/       Pipeline unggah gambar ke R2
│   └── env.ts       Akses binding Cloudflare
├── pages/
│   ├── (publik)     index, profil, potensi, wisata, umkm, peta, berita, kontak
│   ├── admin/       Panel admin (dasbor + kelola konten)
│   └── api/         Endpoint form admin, media, dan cron
└── middleware.ts    Penjaga rute /admin

migrations/          Skema D1 (0001) + data awal (0002)
public/images/       Aset gambar statis
```

## Model Data

Tabel utama di D1: `admin_user`, `page_section`, `wisata`, `umkm`, `berita`, `media`, `media_link` (relasi media polimorfik), `titik_peta` (pin peta), dan `perangkat_desa` (struktur organisasi). Lihat [`migrations/0001_schema.sql`](migrations/0001_schema.sql) untuk detail lengkap.

## Menjalankan di Lokal

**Prasyarat:** Node.js 20+ dan npm.

```bash
# 1. Pasang dependensi
npm install

# 2. Siapkan database D1 lokal (skema + data awal)
npm run db:setup

# 3. Jalankan server pengembangan (build Astro lalu Wrangler)
npm run dev
```

Situs akan tersedia di `http://localhost:4321`.

> **Catatan login lokal:** tanpa runtime Cloudflare, panel admin menerima `admin` / `admin` hanya untuk pengujian. Kredensial ini **tidak** berlaku di produksi.

## Konfigurasi & Rahasia

- Salin `.dev.vars.example` menjadi `.dev.vars` untuk variabel lingkungan lokal. File `.dev.vars` **tidak boleh** di-commit (sudah ada di `.gitignore`).
- `wrangler.toml` memuat ID placeholder — ganti `database_id` (D1) dan `id` (KV) dengan nilai asli setelah membuat resource di akun Cloudflare.
- Rahasia produksi diatur lewat `wrangler secret put NAMA_SECRET`.

## Deploy ke Produksi

```bash
npm run deploy   # astro build && wrangler deploy
```

Sebelum deploy pertama, buat resource Cloudflare berikut dan tempel ID-nya ke `wrangler.toml`:

```bash
wrangler d1 create web-desa-loji-db
wrangler r2 bucket create web-desa-loji-media
wrangler kv namespace create SESSION_KV
```

Cron `0 0 * * 0` (tiap Minggu 00:00 UTC) menjalankan backup database otomatis ke R2.

## Panel Admin

- Halaman setup pertama (`/admin/setup`) membuat akun admin awal — hanya bisa dipakai sekali (saat belum ada admin).
- Login di `/admin/login`, lalu kelola konten dari `/admin/dasbor`.
- Kata sandi disimpan sebagai hash PBKDF2 (SHA-256, 100.000 iterasi) dengan salt acak.

## ⚠️ Status Keamanan

Proyek ini **belum siap dideploy ke publik**. Audit internal menemukan bahwa endpoint `/api/admin/*` belum memverifikasi sesi login, sehingga operasi tulis/hapus dan ekspor data dapat diakses tanpa autentikasi. Perbaikan otorisasi wajib dilakukan sebelum situs dipublikasikan. Lihat catatan tim untuk detail.

## Status Pengembangan

Dibangun mengikuti alur perencanaan terstruktur (brief → PRD → UX → arsitektur → epics & stories). Seluruh 30 story implementasi (Epic 1–7) telah dikerjakan dan menunggu tahap *code review*.

---

*Dikembangkan oleh tim KKN-T Inovasi IPB University 2026 — Desa Loji, Kabupaten Sukabumi.*
