import { NextRequest } from 'next/server';
import { getSiteConfig } from '@/lib/config';
import { securityMiddleware } from '@/lib/security-middleware';
import { createNoCacheResponse } from '@/lib/api-response';

/**
 * API endpoint để lấy site configuration
 * Có thể mở rộng để lấy từ database
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Security: Kiểm tra bảo mật tổng quát
    const securityCheck = await securityMiddleware(request, '/api/config');
    if (securityCheck && !securityCheck.allowed) {
      return createNoCacheResponse({ 
        success: false, 
        message: securityCheck.error || 'Request không hợp lệ' 
      }, securityCheck.statusCode || 400);
    }
    const config = getSiteConfig();
    return createNoCacheResponse({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting config:', error);
    return createNoCacheResponse({
      success: false,
      message: 'Lỗi khi lấy cấu hình'
    }, 500);
  }
}

