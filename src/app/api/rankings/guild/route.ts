import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';
import { fetchRankingFromBackend, getRankingFallback } from '@/lib/ranking-api';

function fallbackResponse() {
  return NextResponse.json({
    success: false,
    data: getRankingFallback('guild'),
    message: 'Không có dữ liệu',
  });
}

export async function GET(request: NextRequest) {
  try {
    let securityCheck: Awaited<ReturnType<typeof securityMiddleware>>;
    try {
      securityCheck = await securityMiddleware(request, '/api/rankings/guild');
    } catch (mwErr) {
      console.error('Rankings guild securityMiddleware:', mwErr);
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

    const result = await fetchRankingFromBackend('guild');
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=180' },
    });
  } catch (error) {
    console.error('Guild ranking error:', error);
    return fallbackResponse();
  }
}
