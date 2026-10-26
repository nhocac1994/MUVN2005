import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';

/**
 * Kiểm tra kết nối backend — chỉ trả trạng thái, không trả URL/IP/port.
 * GET /api/test-backend
 */
export async function GET() {
  const backendUrl = getBackendUrl('/health');
  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn('[test-backend] status', response.status, backendUrl);
      return NextResponse.json({ success: false, message: 'Backend không phản hồi' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Kết nối backend thành công!' });
  } catch (error) {
    console.error('[test-backend] error:', backendUrl, error);
    return NextResponse.json({ success: false, message: 'Không thể kết nối đến backend' }, { status: 502 });
  }
}
