import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';
import { fetchRankingFromBackend, getRankingFallback } from '@/lib/ranking-api';

function fallbackResponse() {
  return NextResponse.json({
    success: false,
    data: getRankingFallback('level'),
    message: 'Không có dữ liệu',
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  });
}

export async function GET(request: NextRequest) {
  try {
    let securityCheck: Awaited<ReturnType<typeof securityMiddleware>>;
    try {
      securityCheck = await securityMiddleware(request, '/api/rankings/level');
    } catch (mwErr) {
      console.error('Rankings level securityMiddleware:', mwErr);
      return fallbackResponse();
    }
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: securityCheck.error || 'Request không hợp lệ',
        },
        { status: securityCheck.statusCode || 400 }
      );
    }

    const pageParam = Number(request.nextUrl.searchParams.get('page') || '1');
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

    const result = await fetchRankingFromBackend('level', page);
    const transformedData = (
      result.data as Array<{
        account: string;
        character: string;
        class: number;
        score: number;
        level?: number | null;
        isOnline?: number | boolean;
      }>
    ).map((char) => ({
      account: char.account,
      character: char.character,
      class: char.class,
      resets: char.score,
      level: char.level ?? 0,
      isOnline: char.isOnline ?? 0,
    }));

    return NextResponse.json(
      {
        success: result.success,
        data: transformedData,
        message: result.success ? result.message : 'Không có dữ liệu',
        pagination: result.pagination,
        meta: result.meta,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('Ranking error:', error);
    return fallbackResponse();
  }
}
