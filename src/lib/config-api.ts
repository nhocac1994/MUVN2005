import siteConfigStatic from '@/config/site.config.json';
import type { RankingTabConfig } from '@/lib/rankings-config';

const BRAND = {
  nameGame: String(siteConfigStatic.nameGame || 'MUVIETNAM2005.COM'),
  gameTitle: String(siteConfigStatic.gameTitle || 'Mu Online Season 1.0'),
  serverName: String(siteConfigStatic.serverName || 'MUVIETNAM2005.COM'),
  serverVersion: String(siteConfigStatic.serverVersion || 'Season 1.0'),
  websiteUrl: String(siteConfigStatic.websiteUrl || 'https://muvietnam2005.com'),
  websiteName: String(siteConfigStatic.websiteName || 'MUVIETNAM2005.COM'),
  email: String(siteConfigStatic.email || 'support@muvietnam2005.com'),
  linkFacebook: String(siteConfigStatic.linkFacebook || ''),
  linkDiscord: String(siteConfigStatic.linkDiscord || ''),
  linkYoutube: String(siteConfigStatic.linkYoutube || ''),
  linkZalo: String(siteConfigStatic.linkZalo || ''),
  linkTikTok: String(siteConfigStatic.linkTikTok || ''),
};

/** Ghi đè tên brand/season từ site.config — tránh remote còn SEASON 2.0.COM / Season 1 */
function applyBrandOverlay(data: SiteConfig): SiteConfig {
  const serverInfo = data.serverInfo ?? {
    name: BRAND.serverName,
    version: BRAND.serverVersion,
    expRate: String(siteConfigStatic.expRate || 'x100'),
    dropRate: String(siteConfigStatic.dropRate || 'x50'),
  };
  const social = data.socialMedia ?? {};
  return {
    ...data,
    nameGame: BRAND.nameGame,
    gameTitle: BRAND.gameTitle,
    serverName: BRAND.serverName,
    serverVersion: BRAND.serverVersion,
    websiteUrl: BRAND.websiteUrl,
    websiteName: BRAND.websiteName,
    email: BRAND.email,
    linkFacebook: BRAND.linkFacebook || data.linkFacebook || social.facebook,
    linkDiscord: BRAND.linkDiscord || data.linkDiscord || social.discord,
    linkYoutube: BRAND.linkYoutube || data.linkYoutube || social.youtube,
    linkZalo: BRAND.linkZalo || data.linkZalo || social.zalo,
    linkTikTok: BRAND.linkTikTok || data.linkTikTok || social.tiktok,
    socialMedia: {
      ...social,
      facebook: BRAND.linkFacebook || social.facebook,
      discord: BRAND.linkDiscord || social.discord,
      youtube: BRAND.linkYoutube || social.youtube,
      zalo: BRAND.linkZalo || social.zalo,
      tiktok: BRAND.linkTikTok || social.tiktok,
    },
    serverInfo: {
      ...serverInfo,
      name: BRAND.serverName,
      version: BRAND.serverVersion,
    },
  };
}

/** Origin nội bộ để server gọi chính proxy Next (fetch Node cần URL tuyệt đối) */
function getAppOriginForServerFetch(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL?.trim()) return `https://${process.env.VERCEL_URL}`;
  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}`;
}

function isBrowser(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as { document?: unknown }).document !== 'undefined';
}

/**
 * Config từ backend: luôn qua proxy Next `/api/remote/...`.
 * Không import getBackendUrl ở đây — tránh nhúng `http://...` vào bundle client (Mixed Content trên Vercel HTTPS).
 */
function configApiFetchUrl(backendPath: string): string {
  if (!backendPath.startsWith('/api/config')) {
    throw new Error(`configApiFetchUrl chỉ hỗ trợ /api/config/* (nhận: ${backendPath})`);
  }
  const tail = backendPath.replace(/^\/api\//, '');
  const proxyPath = `/api/remote/${tail}`;
  if (isBrowser()) {
    return proxyPath;
  }
  return `${getAppOriginForServerFetch()}${proxyPath}`;
}

export interface EventConfig {
  id: number;
  name: string;
  schedule: {
    type: 'hourly' | 'specific';
    interval?: number;
    startMinute?: number;
    times?: string[];
    duration: number;
  };
  color: string;
  /** Phần thưởng rơi (optional — backend có thể bổ sung sau) */
  drop?: string;
}

export interface DownloadLinks {
  mediafire: string;
  mega: string;
  clientVersion: string;
  /** URL YouTube hoặc link video hướng dẫn cài đặt (tùy chọn) */
  guideVideo?: string;
  fileSize?: string;
}

export interface SocialMedia {
  facebook?: string;
  youtube?: string;
  discord?: string;
  zalo?: string;
  tiktok?: string;
}

export interface BankTransfer {
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  qrCodeUrl: string;
}

export interface ServerInfo {
  name: string;
  version: string;
  expRate: string;
  dropRate: string;
}

export interface StatsBoost {
  totalAccounts?: number;
  totalCharacters?: number;
  totalGuilds?: number;
  onlinePlayers?: number;
}

export interface SiteConfig {
  nameGame?: string;
  gameTitle?: string;
  gameSubtitle?: string;
  serverName?: string;
  serverVersion?: string;
  phone?: string;
  email?: string;
  address?: string;
  websiteUrl?: string;
  websiteName?: string;
  linkFacebook?: string;
  linkDiscord?: string;
  linkYoutube?: string;
  linkZalo?: string;
  linkTikTok?: string;
  expRate?: string;
  dropRate?: string;
  serverStandard?: string;
  events: EventConfig[];
  downloadLinks: DownloadLinks;
  socialMedia: SocialMedia;
  bankTransfer: BankTransfer;
  serverInfo: ServerInfo;
  statsBoost?: StatsBoost;
  /** Cấu hình tab xếp hạng (bật/tắt + tên hiển thị) */
  rankings?: {
    tabs?: RankingTabConfig[];
  };
  /** Slug bản tin ghim trang chủ (hiện đủ nội dung) */
  homePinnedNewsSlugs?: string[];
}

/**
 * Lấy tất cả config từ backend (fallback im lặng qua proxy local)
 */
export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    const url = configApiFetchUrl('/api/config');
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data as SiteConfig;
      return applyBrandOverlay({
        ...data,
        linkFacebook: data.linkFacebook ?? data.socialMedia?.facebook,
        linkDiscord: data.linkDiscord ?? data.socialMedia?.discord,
        linkYoutube: data.linkYoutube ?? data.socialMedia?.youtube,
        linkZalo: data.linkZalo ?? data.socialMedia?.zalo,
        linkTikTok: data.linkTikTok ?? data.socialMedia?.tiktok,
      });
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lấy config sự kiện
 */
export async function getEventsConfig(): Promise<EventConfig[]> {
  try {
    const response = await fetch(configApiFetchUrl('/api/config/events'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) return [];
    const result = await response.json();
    if (result.success) return result.data;
    return [];
  } catch {
    return [];
  }
}

/**
 * Lấy config download links
 */
export async function getDownloadConfig(): Promise<DownloadLinks | null> {
  try {
    const response = await fetch(configApiFetchUrl('/api/config/download'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
    // Một số backend chỉ trả downloadLinks trong GET /api/config
    const site = await getSiteConfig();
    return site?.downloadLinks ?? null;
  } catch {
    try {
      const site = await getSiteConfig();
      return site?.downloadLinks ?? null;
    } catch {
      return null;
    }
  }
}

/**
 * Lấy config mạng xã hội
 */
export async function getSocialMediaConfig(): Promise<SocialMedia | null> {
  try {
    const response = await fetch(configApiFetchUrl('/api/config/social'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lấy config chuyển khoản
 */
export async function getBankTransferConfig(): Promise<BankTransfer | null> {
  try {
    const response = await fetch(configApiFetchUrl('/api/config/bank'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lấy config server info
 */
export async function getServerInfoConfig(): Promise<ServerInfo | null> {
  try {
    const response = await fetch(configApiFetchUrl('/api/config/server'), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const result = await response.json();
    
    if (result.success) {
      const info = result.data as ServerInfo;
      return {
        ...info,
        name: BRAND.serverName,
        version: BRAND.serverVersion,
      };
    }
    return null;
  } catch {
    return null;
  }
}
