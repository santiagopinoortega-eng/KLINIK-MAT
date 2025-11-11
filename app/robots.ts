// app/robots.ts
export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://klinik-mat.example';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}