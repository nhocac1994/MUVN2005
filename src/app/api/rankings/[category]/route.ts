import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';
import { fetchRankingFromBackend, getRankingFallback } from '@/lib/ranking-api';
import { getRankingTab, type RankingTabId } from '@/lib/rankings-config';

type RouteContext = { params: Promise<{ category: string }> };

const RANKING_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
};

function fallbackResponse(category: RankingTabId, page: number) {
  const reason = `Backend không phản hồi — kiểm tra terminal Next.js (log [ranking/${category}])`;
  console.error(`[ranking/${category}] ${reason}`);
  return NextResponse.json({
    success: false,
    data: getRankingFallback(category),
    message: 'Không có dữ liệu',
    pagination: {
      page,
      limit: 50,
      total: 0,
      totalPages: 1,
    },
    meta: {
      source: 'fallback',
      category,
      reason,
      page,
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { category } = await context.params;
  const tab = getRankingTab(category as RankingTabId);

  if (!tab) {
    return NextResponse.json({ success: false, message: 'Loại ranking không hợp lệ' }, { status: 404 });
  }

  const pageParam = Number(request.nextUrl.searchParams.get('page') || '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  try {
    let securityCheck: Awaited<ReturnType<typeof securityMiddleware>>;
    try {
      securityCheck = await securityMiddleware(request, `/api/rankings/${category}`);
    } catch {
      return fallbackResponse(category as RankingTabId, page);
    }

    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json(
        { success: false, message: securityCheck.error || 'Request không hợp lệ' },
        { status: securityCheck.statusCode || 400 }
      );
    }

    const result = await fetchRankingFromBackend(category as RankingTabId, page);
    return NextResponse.json(result, { headers: RANKING_CACHE_HEADERS });
  } catch (error) {
    console.error(`[ranking/${category}] Exception:`, error);
    return fallbackResponse(category as RankingTabId, page);
  }
}
