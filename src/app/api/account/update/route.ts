import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import sql from 'mssql';
import { validateAccountId, validateCharacterName, validateEmail, detectSQLInjection, logSuspiciousActivity } from '@/lib/security';
import { getClientIP } from '@/lib/utils';
import { securityMiddleware } from '@/lib/security-middleware';

export async function PUT(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // ✅ Security: Kiểm tra bảo mật tổng quát
    const securityCheck = await securityMiddleware(request, '/api/account/update');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: securityCheck.error || 'Request không hợp lệ' 
      }, { status: securityCheck.statusCode || 400 });
    }

    const { accountId, updateData } = await request.json();
    
    if (!accountId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Account ID không được cung cấp' 
      }, { status: 400 });
    }

    // ✅ Security: Validate accountId
    const accountIdValidation = validateAccountId(accountId);
    if (!accountIdValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/account/update', accountId, 'Invalid account ID format');
      return NextResponse.json({ 
        success: false, 
        message: accountIdValidation.error || 'Account ID không hợp lệ' 
      }, { status: 400 });
    }

    // ✅ Security: Validate update data fields
    if (updateData.memb_name !== undefined) {
      const nameValidation = validateCharacterName(updateData.memb_name);
      if (!nameValidation.valid) {
        logSuspiciousActivity(clientIP, '/api/account/update', updateData.memb_name, 'Invalid character name format');
        return NextResponse.json({ 
          success: false, 
          message: nameValidation.error || 'Tên nhân vật không hợp lệ' 
        }, { status: 400 });
      }
    }

    if (updateData.mail_addr !== undefined) {
      const emailValidation = validateEmail(updateData.mail_addr);
      if (!emailValidation.valid) {
        logSuspiciousActivity(clientIP, '/api/account/update', updateData.mail_addr, 'Invalid email format');
        return NextResponse.json({ 
          success: false, 
          message: emailValidation.error || 'Email không hợp lệ' 
        }, { status: 400 });
      }
    }

    // ✅ Security: Detect SQL injection in all update fields
    const allUpdateValues = Object.values(updateData).filter(v => v !== undefined) as string[];
    if (allUpdateValues.some(value => typeof value === 'string' && detectSQLInjection(value))) {
      logSuspiciousActivity(clientIP, '/api/account/update', accountId, 'SQL Injection attempt detected in update data');
      return NextResponse.json({ 
        success: false, 
        message: 'Input chứa ký tự không hợp lệ' 
      }, { status: 400 });
    }


    const pool = await connectToDatabase();
    
    // Kiểm tra account có tồn tại không
    const checkAccountQuery = `
      SELECT memb___id FROM MEMB_INFO WHERE memb___id = @accountId
    `;
    
    const checkResult = await pool.request()
      .input('accountId', sql.VarChar(10), accountId)
      .query(checkAccountQuery);
    
    if (checkResult.recordset.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tài khoản không tồn tại' 
      }, { status: 404 });
    }

    // Xây dựng query update động
    const updateFields = [];
    const inputs: Record<string, sql.ISqlType> = { accountId: sql.VarChar(10) };
    
    if (updateData.memb_name !== undefined) {
      updateFields.push('memb_name = @memb_name');
      inputs.memb_name = sql.NVarChar(10);
    }
    
    if (updateData.mail_addr !== undefined) {
      updateFields.push('mail_addr = @mail_addr');
      inputs.mail_addr = sql.NVarChar(50);
    }
    
    if (updateData.sno__numb !== undefined) {
      updateFields.push('sno__numb = @sno__numb');
      inputs.sno__numb = sql.NVarChar(18);
    }
    
    if (updateData.post_code !== undefined) {
      updateFields.push('post_code = @post_code');
      inputs.post_code = sql.NVarChar(6);
    }
    
    if (updateData.addr_info !== undefined) {
      updateFields.push('addr_info = @addr_info');
      inputs.addr_info = sql.NVarChar(50);
    }
    
    if (updateData.addr_deta !== undefined) {
      updateFields.push('addr_deta = @addr_deta');
      inputs.addr_deta = sql.NVarChar(50);
    }
    
    if (updateData.tel__numb !== undefined) {
      updateFields.push('tel__numb = @tel__numb');
      inputs.tel__numb = sql.NVarChar(18);
    }
    
    if (updateData.phon_numb !== undefined) {
      updateFields.push('phon_numb = @phon_numb');
      inputs.phon_numb = sql.NVarChar(18);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Không có dữ liệu để cập nhật' 
      }, { status: 400 });
    }

    const updateQuery = `
      UPDATE MEMB_INFO 
      SET ${updateFields.join(', ')}
      WHERE memb___id = @accountId
    `;

    
    const updateRequest = pool.request();
    
    // Add accountId input
    updateRequest.input('accountId', sql.VarChar(10), accountId);
    
    // Add other inputs
    if (updateData.memb_name !== undefined) {
      updateRequest.input('memb_name', sql.NVarChar(10), updateData.memb_name);
    }
    if (updateData.mail_addr !== undefined) {
      updateRequest.input('mail_addr', sql.NVarChar(50), updateData.mail_addr);
    }
    if (updateData.sno__numb !== undefined) {
      updateRequest.input('sno__numb', sql.NVarChar(18), updateData.sno__numb);
    }
    if (updateData.post_code !== undefined) {
      updateRequest.input('post_code', sql.NVarChar(6), updateData.post_code);
    }
    if (updateData.addr_info !== undefined) {
      updateRequest.input('addr_info', sql.NVarChar(50), updateData.addr_info);
    }
    if (updateData.addr_deta !== undefined) {
      updateRequest.input('addr_deta', sql.NVarChar(50), updateData.addr_deta);
    }
    if (updateData.tel__numb !== undefined) {
      updateRequest.input('tel__numb', sql.NVarChar(18), updateData.tel__numb);
    }
    if (updateData.phon_numb !== undefined) {
      updateRequest.input('phon_numb', sql.NVarChar(18), updateData.phon_numb);
    }

    const updateResult = await updateRequest.query(updateQuery);
    

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công',
      data: {
        accountId,
        updatedFields: updateFields.length
      }
    });

  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi khi cập nhật thông tin tài khoản' 
    }, { status: 500 });
  }
}
