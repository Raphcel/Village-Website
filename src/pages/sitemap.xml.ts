import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = getEnv();
  const base = 'https://desaloji.desa.id';

  const staticUrls = [
    { loc: base, priority: '1.0', changefreq: 'weekly' },
    { loc: `${base}/profil`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/potensi`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/wisata`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${base}/umkm`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${base}/berita`, priority: '0.9', changefreq: 'daily' },
    { loc: `${base}/peta`, priority: '0.7', changefreq: 'monthly' },
  ];

  const dynamicUrls: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }> = [];

  if (env?.DB) {
    const wisataRows = await env.DB.prepare(
      "SELECT slug, updated_at FROM wisata WHERE status='published'"
    ).all<{ slug: string; updated_at: string }>();
    for (const w of wisataRows.results ?? []) {
      dynamicUrls.push({
        loc: `${base}/wisata/${w.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: w.updated_at?.split('T')[0],
      });
    }

    const umkmRows = await env.DB.prepare(
      "SELECT slug, updated_at FROM umkm WHERE status='published'"
    ).all<{ slug: string; updated_at: string }>();
    for (const u of umkmRows.results ?? []) {
      dynamicUrls.push({
        loc: `${base}/umkm/${u.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: u.updated_at?.split('T')[0],
      });
    }

    const beritaRows = await env.DB.prepare(
      "SELECT slug, published_at FROM berita WHERE status='published'"
    ).all<{ slug: string; published_at: string }>();
    for (const b of beritaRows.results ?? []) {
      dynamicUrls.push({
        loc: `${base}/berita/${b.slug}`,
        priority: '0.6',
        changefreq: 'yearly',
        lastmod: b.published_at?.split('T')[0],
      });
    }
  }

  const allUrls = [...staticUrls, ...dynamicUrls];
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod ?? today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
