import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';
import { getClientIP } from '@/lib/utils';
import { validateAccountId, validatePassword, detectSQLInjection, logSuspiciousActivity } from '@/lib/security';
import { securityMiddleware } from '@/lib/security-middleware';

export async function PUT(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    const securityCheck = await securityMiddleware(request, '/api/account/password');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: securityCheck.error || 'Request không hợp lệ',
      }, { status: securityCheck.statusCode || 400 });
    }

    const body = await request.json();
    const accountId = String(body.accountId ?? '').trim();
    const currentPassword = String(body.currentPassword ?? '');
    const newPassword = String(body.newPassword ?? '');

    if (!accountId || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (accountId, mật khẩu hiện tại hoặc mật khẩu mới)',
      }, { status: 400 });
    }

    const accountIdValidation = validateAccountId(accountId);
    if (!accountIdValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/account/password', accountId, 'Invalid account ID format');
      return NextResponse.json({
        success: false,
        message: accountIdValidation.error || 'Account ID không hợp lệ',
      }, { status: 400 });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/account/password', '***', 'Invalid password format');
      return NextResponse.json({
        success: false,
        message: passwordValidation.error || 'Mật khẩu mới không hợp lệ',
      }, { status: 400 });
    }

    if (
      detectSQLInjection(accountId) ||
      detectSQLInjection(newPassword) ||
      detectSQLInjection(currentPassword)
    ) {
      logSuspiciousActivity(clientIP, '/api/account/password', accountId, 'SQL Injection attempt detected');
      return NextResponse.json({
        success: false,
        message: 'Input không hợp lệ',
      }, { status: 400 });
    }

    const backendResponse = await fetch(getBackendUrl('/api/auth/password'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, currentPassword, newPassword }),
    });

    const backendData = await backendResponse.json();

    if (backendData.success) {
      return NextResponse.json({
        success: true,
        message: backendData.message || 'Đổi mật khẩu thành công',
      });
    }

    return NextResponse.json({
      success: false,
      message: backendData.message || 'Lỗi khi đổi mật khẩu',
    }, { status: backendResponse.status || 400 });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.',
    }, { status: 500 });
  }
}
