import fs from 'fs';
import path from 'path';
import siteConfigStatic from '@/config/site.config.json';

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

/** Config runtime từ backend local (nếu có) hoặc site.config.json */
export function getLocalSiteConfig(): Record<string, unknown> {
  const fromBackend = readJsonFile<Record<string, unknown>>(
    path.join(process.cwd(), 'backend/config/site-config.json')
  );
  if (fromBackend) return fromBackend;

  const s = siteConfigStatic as Record<string, unknown>;
  const dl = (s.downloadLinks ?? {}) as Record<string, string>;
  return {
    ...s,
    events: [],
    downloadLinks: dl,
    socialMedia: {
      facebook: s.linkFacebook,
      youtube: s.linkYoutube,
      discord: s.linkDiscord,
      zalo: s.linkZalo,
      tiktok: s.linkTikTok,
    },
    bankTransfer: s.bankTransfer ?? {},
    serverInfo: {
      name: s.serverName ?? s.nameGame,
      version: s.serverVersion ?? 'Season 1.0',
      expRate: s.expRate ?? 'x100',
      dropRate: s.dropRate ?? 'x50',
    },
  };
}

export function buildRemoteFallback(normalizedPath: string): { success: boolean; data: unknown } | null {
  const cfg = getLocalSiteConfig();

  if (normalizedPath === 'config') {
    return { success: true, data: cfg };
  }
  if (normalizedPath === 'config/events') {
    return { success: true, data: cfg.events ?? [] };
  }
  if (normalizedPath === 'config/download') {
    return { success: true, data: cfg.downloadLinks ?? {} };
  }
  if (normalizedPath === 'config/social') {
    return { success: true, data: cfg.socialMedia ?? {} };
  }
  if (normalizedPath === 'config/bank') {
    return { success: true, data: cfg.bankTransfer ?? {} };
  }
  if (normalizedPath === 'config/server') {
    return { success: true, data: cfg.serverInfo ?? {} };
  }
  if (normalizedPath === 'news') {
    return { success: true, data: [] };
  }
  if (normalizedPath.startsWith('news/')) {
    return null;
  }
  return null;
}
