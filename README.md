# Desa Loji Website

The official website of Desa Loji, Simpenan District, Sukabumi Regency — built as part of the **KKN-T Inovasi IPB University 2026** program. The site presents the village profile, its potential (agriculture, fisheries, tourism), a directory of local businesses (UMKM), an interactive map, and village news. It also includes an admin panel so village staff can manage all content themselves without technical help.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 7](https://astro.build) (`server` / SSR mode) |
| Hosting & Runtime | [Cloudflare Workers](https://workers.cloudflare.com) (via `@astrojs/cloudflare`) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| Media storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) (objects/images) |
| Login sessions | [Cloudflare KV](https://developers.cloudflare.com/kv/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Maps | [Leaflet](https://leafletjs.com) |
| Interactive components | React 19 |

## Project Structure

```
src/
├── components/      UI components (Layout, Nav, Footer, Button, Card, etc.)
├── lib/
│   ├── auth/        Password hashing (PBKDF2) & KV sessions
│   ├── db/          D1 data access per entity (wisata, umkm, berita, etc.)
│   ├── cache/       Public page cache purging
│   ├── media/       Image upload pipeline to R2
│   └── env.ts       Cloudflare binding access
├── pages/
│   ├── (public)     index, profil, potensi, wisata, umkm, peta, berita, kontak
│   ├── admin/       Admin panel (dashboard + content management)
│   └── api/         Admin form, media, and cron endpoints
└── middleware.ts    /admin route guard

migrations/          D1 schema (0001) + seed data (0002)
public/images/       Static image assets
```

## Data Model

Main D1 tables: `admin_user`, `page_section`, `wisata`, `umkm`, `berita`, `media`, `media_link` (polymorphic media relation), `titik_peta` (map pins), and `perangkat_desa` (village staff structure). See [`migrations/0001_schema.sql`](migrations/0001_schema.sql) for full details.

## Running Locally

**Prerequisites:** Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Set up the local D1 database (schema + seed data)
npm run db:setup

# 3. Start the dev server (Astro build, then Wrangler)
npm run dev
```

The site will be available at `http://localhost:4321`.

> **Local login note:** without the Cloudflare runtime, the admin panel accepts `admin` / `admin` for testing only. These credentials do **not** work in production.

## Configuration & Secrets

- Copy `.dev.vars.example` to `.dev.vars` for local environment variables. The `.dev.vars` file must **not** be committed (it is already in `.gitignore`).
- `wrangler.toml` contains placeholder IDs — replace `database_id` (D1) and `id` (KV) with real values after creating the resources in your Cloudflare account.
- Production secrets are set via `wrangler secret put SECRET_NAME`.

## Deploy

```bash
npm run deploy   # astro build && wrangler deploy
```

Before the first deploy, create the following Cloudflare resources and paste their IDs into `wrangler.toml`:

```bash
wrangler d1 create web-desa-loji-db
wrangler r2 bucket create web-desa-loji-media
wrangler kv namespace create SESSION_KV
```

A cron job (`0 0 * * 0`, every Sunday at 00:00 UTC) runs an automatic database backup to R2.

## Admin Panel

- The first-run setup page (`/admin/setup`) creates the initial admin account — it works only once (while no admin user exists yet).
- Log in at `/admin/login`, then manage content from `/admin/dasbor`.
- Passwords are stored as PBKDF2 hashes (SHA-256, 100,000 iterations) with a random salt.

## Contributors

- **Rafif Muhammad Farras** — developer (KKN-T Inovasi IPB University 2026)
