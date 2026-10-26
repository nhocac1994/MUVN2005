import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';
import { validateAccountId, detectSQLInjection, logSuspiciousActivity } from '@/lib/security';
import { getClientIP } from '@/lib/utils';
import { getMuClassName } from '@/lib/mu-classes';
import { securityMiddleware, validateAccountIdWithLogging } from '@/lib/security-middleware';

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // ✅ Security: Kiểm tra bảo mật tổng quát
    const securityCheck = await securityMiddleware(request, '/api/characters');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: securityCheck.error || 'Request không hợp lệ' 
      }, { status: securityCheck.statusCode || 400 });
    }

    const accountId = request.nextUrl.searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Account ID không được cung cấp' 
      }, { status: 400 });
    }

    // ✅ Security: Validate accountId với logging tự động
    const accountIdValidation = validateAccountIdWithLogging(accountId, '/api/characters', clientIP);
    if (!accountIdValidation.valid) {
      return NextResponse.json({ 
        success: false, 
        message: accountIdValidation.error || 'Account ID không hợp lệ' 
      }, { status: 400 });
    }

    // Lấy JWT token từ header
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.headers.get('x-auth-token') || '';

    // Gọi Backend API
    const backendResponse = await fetch(
      getBackendUrl(`/api/characters?accountId=${encodeURIComponent(accountId)}`),
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
    );

    const backendData = await backendResponse.json();

    if (backendData.success) {
      const formattedCharacters = backendData.data.map((char: Record<string, unknown>) => ({
        name: char.Name,
        level: char.cLevel,
        class: char.Class,
        className: getMuClassName(Number(char.Class ?? 0)),
        resetCount: char.ResetCount,
        masterResetCount: char.MasterResetCount,
        stats: {
          strength: char.Strength,
          dexterity: char.Dexterity,
          vitality: char.Vitality,
          energy: char.Energy,
          leadership: char.Leadership
        },
        life: char.Life,
        maxLife: char.MaxLife,
        mana: char.Mana,
        maxMana: char.MaxMana,
        money: char.Money,
        mapNumber: char.MapNumber,
        mapPosX: char.MapPosX,
        mapPosY: char.MapPosY,
        pkCount: char.PkCount ?? char.PKCount ?? 0,
        pkLevel: char.PkLevel ?? char.PKLevel ?? 0
      }));

      return NextResponse.json({
        success: true,
        data: {
          characters: formattedCharacters,
          totalCharacters: formattedCharacters.length
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: backendData.message || 'Lỗi khi lấy danh sách characters' 
      }, { status: backendResponse.status });
    }

  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.' 
    }, { status: 500 });
  }
}
