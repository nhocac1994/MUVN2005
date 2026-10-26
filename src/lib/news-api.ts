export type NewsType = 'Notice' | 'Event' | 'Update' | 'Hot';

export interface NewsArticleListItem {
  id: string;
  slug: string;
  type: NewsType;
  title: string;
  excerpt: string;
  publishedAt: string;
  published: boolean;
  /** Thứ tự hiển thị — index/sortOrder = 1 → ghim cuối trang chủ, hiện đủ nội dung */
  sortOrder: number;
  /** Alias một số backend Windows dùng `index` thay cho sortOrder */
  index?: number;
  contentFormat?: 'markdown' | 'text' | 'html';
  pinned?: boolean;
}

export interface NewsArticle extends NewsArticleListItem {
  content: string;
}

function isBrowser(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as { document?: unknown }).document !== 'undefined';
}

function getAppOriginForServerFetch(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL?.trim()) return `https://${process.env.VERCEL_URL}`;
  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}`;
}

function newsFetchUrl(path: string): string {
  const proxyPath = `/api/remote/${path.replace(/^\/api\//, '')}`;
  if (isBrowser()) return proxyPath;
  return `${getAppOriginForServerFetch()}${proxyPath}`;
}

/** Chuẩn hóa index/sortOrder từ list item */
export function newsIndexOf(item: NewsArticleListItem | Record<string, unknown>): number {
  const n = Number(
    (item as { index?: unknown }).index ?? (item as { sortOrder?: unknown }).sortOrder ?? 0
  );
  return Number.isFinite(n) ? n : 0;
}

export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${Number(m)}/${y}`;
}

export function formatNewsDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return formatNewsDate(iso);
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function getNewsList(): Promise<NewsArticleListItem[]> {
  try {
    const res = await fetch(newsFetchUrl('news'), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(newsFetchUrl(`news/${encodeURIComponent(slug)}`), { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Bản tin index/sortOrder = 1 → ghim cuối trang chủ, hiện đủ nội dung.
 * Không cần field backend mới — chỉ đặt index (hoặc sortOrder) = 1.
 */
export async function getPinnedNewsArticles(): Promise<NewsArticle[]> {
  const list = await getNewsList();
  const indexOne = list.filter((n) => newsIndexOf(n) === 1);

  if (indexOne.length === 0) return [];

  const articles = await Promise.all(indexOne.map((n) => getNewsArticle(n.slug)));
  return articles.filter((a): a is NewsArticle => !!a && a.published !== false);
}

export function newsArticleLink(slug: string): string {
  return `/news/${slug}`;
}
