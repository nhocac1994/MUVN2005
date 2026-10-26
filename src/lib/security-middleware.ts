/**
 * Security Middleware để bảo vệ tất cả API routes
 * Tự động validate và detect SQL injection cho mọi request
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectSQLInjection, validateAccountId, validateCharacterName, validateEmail, validatePassword, logSuspiciousActivity } from './security';
import { getClientIP } from './utils';

interface SecurityCheckResult {
  allowed: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Kiểm tra bảo mật cho request body
 */
export function checkRequestBodySecurity(body: any, endpoint: string, clientIP: string): SecurityCheckResult {
  if (!body || typeof body !== 'object') {
    return { allowed: true };
  }

  // Kiểm tra tất cả các giá trị string trong body
  const checkValue = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      if (detectSQLInjection(value)) {
        logSuspiciousActivity(clientIP, endpoint, value.substring(0, 100), `SQL Injection detected in ${path}`);
        return false;
      }
    } else if (Array.isArray(value)) {
      return value.every((item, index) => checkValue(item, `${path}[${index}]`));
    } else if (value && typeof value === 'object') {
      return Object.entries(value).every(([key, val]) => checkValue(val, path ? `${path}.${key}` : key));
    }
    return true;
  };

  if (!checkValue(body)) {
    return {
      allowed: false,
      error: 'Input chứa ký tự không hợp lệ',
      statusCode: 400
    };
  }

  return { allowed: true };
}

/**
 * Kiểm tra bảo mật cho query parameters
 */
export function checkQueryParamsSecurity(searchParams: URLSearchParams, endpoint: string, clientIP: string): SecurityCheckResult {
  for (const [key, value] of searchParams.entries()) {
    if (detectSQLInjection(value)) {
      logSuspiciousActivity(clientIP, endpoint, value, `SQL Injection detected in query param: ${key}`);
      return {
        allowed: false,
        error: 'Query parameter không hợp lệ',
        statusCode: 400
      };
    }
  }

  return { allowed: true };
}

/**
 * Kiểm tra bảo mật cho headers
 */
export function checkHeadersSecurity(headers: Headers, endpoint: string, clientIP: string): SecurityCheckResult {
  // Kiểm tra các headers có thể chứa user input
  const suspiciousHeaders = ['x-user-account', 'x-account-id', 'x-character-name'];
  
  for (const headerName of suspiciousHeaders) {
    const headerValue = headers.get(headerName);
    if (headerValue && detectSQLInjection(headerValue)) {
      logSuspiciousActivity(clientIP, endpoint, headerValue, `SQL Injection detected in header: ${headerName}`);
      return {
        allowed: false,
        error: 'Header không hợp lệ',
        statusCode: 400
      };
    }
  }

  return { allowed: true };
}

/**
 * Middleware bảo mật tổng quát cho API routes
 * Sử dụng trong mỗi API route handler
 */
export async function securityMiddleware(
  request: NextRequest,
  endpoint: string
): Promise<SecurityCheckResult | null> {
  const clientIP = getClientIP(request);

  // 1. Kiểm tra query parameters
  const queryCheck = checkQueryParamsSecurity(request.nextUrl.searchParams, endpoint, clientIP);
  if (!queryCheck.allowed) {
    return queryCheck;
  }

  // 2. Kiểm tra headers
  const headersCheck = checkHeadersSecurity(request.headers, endpoint, clientIP);
  if (!headersCheck.allowed) {
    return headersCheck;
  }

  // 3. Kiểm tra request body (nếu có)
  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await request.clone().json();
      const bodyCheck = checkRequestBodySecurity(body, endpoint, clientIP);
      if (!bodyCheck.allowed) {
        return bodyCheck;
      }
    }
  } catch (error) {
    // Nếu không parse được JSON, có thể là request không hợp lệ
    // Nhưng không block vì có thể là form data hoặc loại khác
  }

  return null; // Allowed
}

/**
 * Validate account ID với logging tự động
 */
export function validateAccountIdWithLogging(
  accountId: string | null | undefined,
  endpoint: string,
  clientIP: string
): { valid: boolean; error?: string } {
  if (!accountId) {
    return { valid: false, error: 'Account ID không được cung cấp' };
  }

  const validation = validateAccountId(accountId);
  if (!validation.valid) {
    logSuspiciousActivity(clientIP, endpoint, accountId, 'Invalid account ID format');
  }

  if (detectSQLInjection(accountId)) {
    logSuspiciousActivity(clientIP, endpoint, accountId, 'SQL Injection detected in account ID');
    return { valid: false, error: 'Input không hợp lệ' };
  }

  return validation;
}

/**
 * Wrapper function để bảo vệ API route handler
 * Tự động kiểm tra bảo mật trước khi chạy handler
 */
export function withSecurity<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  endpoint: string
) {
  return async (request: NextRequest): Promise<NextResponse<any>> => {
    // Chạy security middleware
    const securityCheck = await securityMiddleware(request, endpoint);
    
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json(
        { success: false, message: securityCheck.error || 'Request không hợp lệ' },
        { status: securityCheck.statusCode || 400 }
      );
    }

    // Nếu pass security check, chạy handler
    return handler(request);
  };
}

