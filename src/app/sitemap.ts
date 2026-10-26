import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.websiteUrl.replace(/\/+$/, '');
  const paths = ['', '/news', '/rankings', '/download', '/guide', '/info', '/register', '/login'];

  return paths.map((path) => ({
    url: `${base}${path || '/'}`,
    changeFrequency: path === '' || path === '/news' || path === '/rankings' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
