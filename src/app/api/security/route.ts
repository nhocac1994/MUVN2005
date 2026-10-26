import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Kiểm tra các pattern độc hại
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    // Kiểm tra dữ liệu đầu vào
    const checkForMaliciousContent = (input: string) => {
      return maliciousPatterns.some(pattern => pattern.test(input));
    };

    if (action === 'validate') {
      const isValid = !checkForMaliciousContent(data);
      
      return NextResponse.json({
        success: isValid,
        message: isValid ? 'Dữ liệu hợp lệ' : 'Phát hiện nội dung độc hại'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Action không hợp lệ'
    }, { status: 400 });

  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi xử lý bảo mật'
    }, { status: 500 });
  }
}
