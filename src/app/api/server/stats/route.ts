import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';
import { securityMiddleware } from '@/lib/security-middleware';

export async function GET(request: NextRequest) {
  try {
    const securityCheck = await securityMiddleware(request, '/api/server/stats');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json(
        { success: false, message: securityCheck.error || 'Request không hợp lệ' },
        { status: securityCheck.statusCode || 400 }
      );
    }

    const backendResponse = await fetch(getBackendUrl('/api/server/stats'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: `Không lấy được thống kê server (HTTP ${backendResponse.status})` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('[api/server/stats]', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi kết nối thống kê server' },
      { status: 500 }
    );
  }
}
