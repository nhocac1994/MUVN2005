import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import sql from 'mssql';
import { securityMiddleware } from '@/lib/security-middleware';

export async function GET(request: NextRequest) {
  try {
    // ✅ Security: Kiểm tra bảo mật tổng quát
    const securityCheck = await securityMiddleware(request, '/api/accounts');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: securityCheck.error || 'Request không hợp lệ' 
      }, { status: securityCheck.statusCode || 400 });
    }

    console.log('Getting available accounts...');
    const pool = await connectToDatabase();
    console.log('Database connected successfully');

    // Lấy danh sách 10 account đầu tiên có character
    const accountsQuery = `
      SELECT TOP 10
        c.AccountID,
        c.Name as CharacterName,
        c.cLevel,
        c.Class,
        c.Money,
        c.ResetCount,
        c.MasterResetCount,
        mi.memb_name,
        mi.mail_addr,
        mi.bloc_code
      FROM Character c
      INNER JOIN MEMB_INFO mi ON c.AccountID = mi.memb___id
      ORDER BY c.cLevel DESC, c.Experience DESC
    `;

    console.log('Executing accounts query...');
    const accountsResult = await pool.request().query(accountsQuery);
    console.log('Found accounts:', accountsResult.recordset.length);

    await pool.close();
    console.log('Database connection closed');

    return NextResponse.json({
      success: true,
      message: 'Danh sách account thành công',
      data: {
        accounts: accountsResult.recordset
      }
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách account',
    }, { status: 500 });
  }
}
