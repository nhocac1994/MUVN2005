import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';
import { getClientIP } from '@/lib/utils';
import { validateAccountId, validatePassword, detectSQLInjection, logSuspiciousActivity } from '@/lib/security';
import { securityMiddleware } from '@/lib/security-middleware';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // ✅ Security: Kiểm tra bảo mật tổng quát
    const securityCheck = await securityMiddleware(request, '/api/login');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: securityCheck.error || 'Request không hợp lệ' 
      }, { status: securityCheck.statusCode || 400 });
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vui lòng nhập đầy đủ thông tin' 
      }, { status: 400 });
    }

    // ✅ Security: Validate username
    const usernameValidation = validateAccountId(username);
    if (!usernameValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/login', username, 'Invalid username format');
      return NextResponse.json({ 
        success: false, 
        message: usernameValidation.error || 'Tên đăng nhập không hợp lệ' 
      }, { status: 400 });
    }

    // ✅ Security: Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/login', '***', 'Invalid password format');
      return NextResponse.json({ 
        success: false, 
        message: passwordValidation.error || 'Mật khẩu không hợp lệ' 
      }, { status: 400 });
    }

    // ✅ Security: Detect SQL injection attempts
    if (detectSQLInjection(username) || detectSQLInjection(password)) {
      logSuspiciousActivity(clientIP, '/api/login', username, 'SQL Injection attempt detected');
      return NextResponse.json({ 
        success: false, 
        message: 'Input không hợp lệ' 
      }, { status: 400 });
    }

    // Check rate limit
    const rateLimitResponse = await fetch(`${request.nextUrl.origin}/api/rate-limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: clientIP, action: 'check' })
    });
    
    const rateLimitData = await rateLimitResponse.json();
    
    if (!rateLimitData.allowed) {
      const resetTime = new Date(rateLimitData.resetTime).toLocaleString('vi-VN');
      return NextResponse.json({ 
        success: false, 
        message: `Bạn đã vượt quá giới hạn đăng nhập (5 lần/24h). Thử lại sau: ${resetTime}` 
      }, { status: 429 });
    }

    // Gọi Backend API
    const backendResponse = await fetch(getBackendUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const backendData = await backendResponse.json();

    // Increment rate limit counter
    await fetch(`${request.nextUrl.origin}/api/rate-limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: clientIP, action: 'increment' })
    });

    if (backendData.success) {
      return NextResponse.json({ 
        success: true, 
        message: backendData.message,
        data: {
          ...backendData.user,
          token: backendData.token // Thêm JWT token
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: backendData.message 
      }, { status: backendResponse.status });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.' 
    }, { status: 500 });
  }
}
