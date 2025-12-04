import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

// In-memory cache for sitemap XML with a short TTL to improve performance
let sitemapCache: { xml: string; ts: number } = { xml: '', ts: 0 };
const TTL_MS = 60_000; // 60 seconds

// Resolve canonical site base URL; defaults to malahida.com
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.malahida.com';
}

// Minimal XML escaping for <loc> values
function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Construct article URL in the form /articles/<slug>-<id>
function buildArticleUrl(slug: string, id: string) {
  const base = getBaseUrl();
  return `${base}/articles/${slug}-${id}`;
}

// Build the full sitemap XML including static routes and up to 50k article URLs
function generateXml(articles: Array<{ slug: string; updatedAt: Date | string; _id: any }>) {
  const base = getBaseUrl();
  const staticUrls = [
    '',
    '/articles',
    '/hedra',
    '/about',
    '/contact',
  ];

  const staticXml = staticUrls
    .map((path) => `
    <url>
      <loc>${xmlEscape(`${base}${path}`)}</loc>
      <changefreq>${path === '' || path === '/articles' ? 'daily' : 'monthly'}</changefreq>
      <priority>${path === '' ? '1.0' : path === '/articles' ? '0.9' : '0.7'}</priority>
    </url>
  `)
    .join('');

  // Limit to 50,000 URLs per sitemap file
  const limited = articles.slice(0, 50000);
  const articlesXml = limited
    .map((a) => {
      const loc = buildArticleUrl(a.slug, String(a._id));
      const lastmod = new Date(a.updatedAt).toISOString();
      return `
    <url>
      <loc>${xmlEscape(loc)}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticXml}
  ${articlesXml}
</urlset>
`;
}

// Return cached sitemap XML or regenerate from DB when stale
export async function getSitemapXmlCached() {
  const now = Date.now();
  if (sitemapCache.xml && now - sitemapCache.ts < TTL_MS) {
    return sitemapCache.xml;
  }
  await connectDB();
  const docs = await Article.find({})
    .select('slug updatedAt _id')
    .sort({ updatedAt: -1 })
    .lean();
  const xml = generateXml(docs as any);
  sitemapCache = { xml, ts: now };
  return xml;
}

// Clear cache so next sitemap request reflects new changes immediately
export function invalidateSitemap() {
  sitemapCache = { xml: '', ts: 0 };
}

// Non-blocking ping to Google with simple retry/backoff
export function pingGoogleSitemap() {
  const base = getBaseUrl();
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${base}/sitemap.xml`)}`;

  const attempt = (retries: number, delayMs: number) => {
    fetch(pingUrl)
      .then(() => {})
      .catch(() => {
        if (retries > 0) {
          setTimeout(() => attempt(retries - 1, delayMs * 2), delayMs);
        }
      });
  };

  setTimeout(() => attempt(3, 1000), 0);
}
