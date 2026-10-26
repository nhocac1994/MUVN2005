import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';

function isAllowedAdminPath(segments: string[]): boolean {
  if (!segments.length) return false;
  if (segments[0] === 'login' && segments.length === 1) return true;
  if (segments[0] === 'config' && segments.length === 1) return true;
  if (segments[0] === 'news') return true;
  return false;
}

async function proxyAdmin(request: NextRequest, segments: string[]) {
  if (!isAllowedAdminPath(segments)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const path = `/api/admin/${segments.join('/')}`;
  const backendUrl = getBackendUrl(path);
  const method = request.method;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  };
  const auth = request.headers.get('authorization');
  const adminKey = request.headers.get('x-admin-key');
  if (auth) headers.Authorization = auth;
  if (adminKey) headers['X-Admin-Key'] = adminKey;

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.text();
  }

  try {
    const backendResponse = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: 'no-store',
    });
    const text = await backendResponse.text();
    return new NextResponse(text, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (e) {
    console.error('[api/admin] Proxy failed:', backendUrl, e);
    return NextResponse.json(
      { success: false, message: 'Không kết nối được backend' },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await context.params;
  return proxyAdmin(request, segments);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await context.params;
  return proxyAdmin(request, segments);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await context.params;
  return proxyAdmin(request, segments);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await context.params;
  return proxyAdmin(request, segments);
}
