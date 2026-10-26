import { getBackendUrl } from '@/config/backend.config';
import { guildMarkToDataUrl } from '@/lib/guild-mark';
import type { RankingTabId } from '@/lib/rankings-config';

export type CharacterRankingRow = {
  account: string;
  character: string;
  class: number;
  score: number;
  level?: number | null;
  isOnline?: number | boolean;
};

export type GuildRankingRow = {
  guildName: string;
  score: number;
  guildMaster: string;
  memberCount: number;
  guildMark?: string | null;
};

export type RankingPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RankingMeta = {
  source: 'database' | 'fallback';
  category: RankingTabId;
  rowCount?: number;
};

const FETCH_TIMEOUT_MS = 25000;
const CACHE_TTL_MS = 60_000;

type RankingFetchResult = {
  success: boolean;
  data: CharacterRankingRow[] | GuildRankingRow[];
  message?: string;
  pagination?: RankingPagination;
  meta: RankingMeta;
};

const rankingCache = new Map<string, { result: RankingFetchResult; fetchedAt: number }>();
const rankingInflight = new Map<string, Promise<RankingFetchResult>>();

function cacheKey(category: RankingTabId, page: number): string {
  return `${category}:p${page}`;
}

function cloneRankingResult(result: RankingFetchResult, message?: string): RankingFetchResult {
  return {
    ...result,
    message: message ?? result.message,
    meta: { ...result.meta },
    pagination: result.pagination ? { ...result.pagination } : undefined,
  };
}

const CHARACTER_ENDPOINTS: RankingTabId[] = [
  'level',
  'killers',
  'online',
  'blood-castle',
  'devil-square',
  'chaos-castle',
  'kundun',
  'erohim',
  'red-dragon',
];

function transformCharacterRow(char: Record<string, unknown>): CharacterRankingRow {
  return {
    account: String(char.AccountID ?? char.account ?? ''),
    character: String(char.Name ?? char.character ?? ''),
    class: Number(char.Class ?? char.class ?? 0),
    score: Number(char.Score ?? char.ResetCount ?? char.resets ?? char.score ?? 0),
    level: char.cLevel != null ? Number(char.cLevel) : char.level != null ? Number(char.level) : null,
    isOnline: (char.IsOnline ?? char.isOnline ?? 0) as number | boolean,
  };
}

function transformGuildRow(guild: Record<string, unknown>): GuildRankingRow {
  const rawMark = guild.G_Mark ?? guild.guildMark;
  const memberCount = Number(guild.G_Count ?? guild.MemberCount ?? guild.memberCount ?? 0);
  return {
    guildName: String(guild.G_Name ?? guild.guildName ?? ''),
    score: Number(guild.G_Score ?? guild.score ?? 0),
    guildMaster: String(guild.G_Master ?? guild.guildMaster ?? 'Unknown'),
    memberCount,
    guildMark: guildMarkToDataUrl(rawMark),
  };
}

function parsePagination(
  raw: unknown,
  page: number,
  rowCount: number
): RankingPagination | undefined {
  if (!raw || typeof raw !== 'object') {
    // Backend cũ không trả pagination → coi như 1 trang
    return {
      page,
      limit: Math.max(rowCount, 1),
      total: rowCount,
      totalPages: 1,
    };
  }
  const p = raw as Record<string, unknown>;
  const limit = Number(p.limit ?? rowCount) || 50;
  const total = Number(p.total ?? rowCount) || rowCount;
  const totalPages = Math.max(1, Number(p.totalPages ?? Math.ceil(total / limit)) || 1);
  const currentPage = Math.max(1, Number(p.page ?? page) || page);
  return { page: currentPage, limit, total, totalPages };
}

function getBackendCandidates(category: RankingTabId, page: number): string[] {
  const primary = getBackendUrl(`/api/rankings/${category}?page=${page}`);
  const urls = [primary];

  const isDev = process.env.NODE_ENV === 'development';
  const local = `http://127.0.0.1:3001/api/rankings/${category}?page=${page}`;
  if (isDev && !primary.includes('127.0.0.1') && !primary.includes('localhost')) {
    urls.push(local);
  }

  return [...new Set(urls)];
}

function formatFetchError(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: Error }).cause;
    if (cause instanceof Error) return `${error.message} — ${cause.message}`;
    return error.message;
  }
  return String(error);
}

async function fetchRankingFromBackendOnce(
  category: RankingTabId,
  page: number
): Promise<RankingFetchResult> {
  const triedUrls = getBackendCandidates(category, page);
  const errors: string[] = [];

  for (const url of triedUrls) {
    try {
      console.log(`[ranking/${category}] Đang gọi backend: ${url}`);

      const backendResponse = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      const bodyText = await backendResponse.text();
      let backendData: {
        success?: boolean;
        data?: unknown;
        message?: string;
        pagination?: unknown;
      };

      try {
        backendData = JSON.parse(bodyText);
      } catch {
        errors.push(`${url} → HTTP ${backendResponse.status}, body không phải JSON`);
        console.warn(`[ranking/${category}] ${errors[errors.length - 1]}`);
        continue;
      }

      if (!backendResponse.ok) {
        const msg = `${url} → HTTP ${backendResponse.status}: ${backendData.message ?? bodyText.slice(0, 120)}`;
        errors.push(msg);
        console.warn(`[ranking/${category}] ${msg}`);
        continue;
      }

      if (!backendData.success || !Array.isArray(backendData.data)) {
        const msg = `${url} → response không hợp lệ (success=${backendData.success})`;
        errors.push(msg);
        console.warn(`[ranking/${category}] ${msg}`);
        continue;
      }

      const rowCount = backendData.data.length;
      const pagination = parsePagination(backendData.pagination, page, rowCount);
      console.log(
        `[ranking/${category}] OK — ${rowCount} dòng (trang ${pagination?.page}/${pagination?.totalPages}, total ${pagination?.total}) từ ${url}`
      );

      const meta: RankingMeta = {
        source: 'database',
        category,
        rowCount,
      };

      if (category === 'guild') {
        return {
          success: true,
          data: backendData.data.map((row: Record<string, unknown>) => transformGuildRow(row)),
          message: backendData.message ?? 'Lấy danh sách guild ranking từ database.',
          pagination,
          meta,
        };
      }

      return {
        success: true,
        data: backendData.data.map((row: Record<string, unknown>) => transformCharacterRow(row)),
        message: backendData.message ?? 'Lấy danh sách ranking từ database.',
        pagination,
        meta,
      };
    } catch (error) {
      const msg = `${url} → ${formatFetchError(error)}`;
      errors.push(msg);
      console.warn(`[ranking/${category}] ${msg}`);
    }
  }

  const reason = errors.join(' | ') || 'Không gọi được backend';
  console.error(`[ranking/${category}] Không có dữ liệu. Lý do: ${reason}`);

  return {
    success: false,
    data: [],
    message: 'Không có dữ liệu',
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
    },
    meta: {
      source: 'fallback',
      category,
    },
  };
}

export async function fetchRankingFromBackend(
  category: RankingTabId,
  page = 1
): Promise<RankingFetchResult> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const key = cacheKey(category, safePage);
  const now = Date.now();
  const cached = rankingCache.get(key);

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cloneRankingResult(cached.result);
  }

  const inflight = rankingInflight.get(key);
  if (inflight) {
    return inflight;
  }

  const request = fetchRankingFromBackendOnce(category, safePage)
    .then((result) => {
      if (result.meta.source === 'database' && result.success) {
        rankingCache.set(key, { result, fetchedAt: Date.now() });
      }
      return result;
    })
    .finally(() => {
      rankingInflight.delete(key);
    });

  rankingInflight.set(key, request);
  return request;
}

export function getRankingFallback(_category: RankingTabId): CharacterRankingRow[] | GuildRankingRow[] {
  return [];
}

export function isCharacterRankingCategory(category: string): category is RankingTabId {
  return CHARACTER_ENDPOINTS.includes(category as RankingTabId) || category === 'level';
}
