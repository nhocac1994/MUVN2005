import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';

export async function GET(request: NextRequest) {
  try {
    // ✅ Security: Kiểm tra bảo mật tổng quát
    const securityCheck = await securityMiddleware(request, '/api/events/check');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: securityCheck.error || 'Request không hợp lệ' 
      }, { status: securityCheck.statusCode || 400 });
    }
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Event schedules
    const events = [
      {
        name: 'Chaos Castle',
        interval: 2, // Every 2 hours
        duration: 10, // 10 minutes
        startHour: 1, // Starts at odd hours
        nextTime: getNextEventTime(2, 1, currentHour, currentMinute)
      },
      {
        name: 'Devil Square',
        interval: 4, // Every 4 hours
        duration: 10, // 10 minutes
        startHour: 0, // Starts at even hours (0, 4, 8, 12...)
        nextTime: getNextEventTime(4, 0, currentHour, currentMinute)
      },
      {
        name: 'Blood Castle',
        interval: 2, // Every 2 hours
        duration: 10, // 10 minutes
        startHour: 0, // Starts at even hours (0, 2, 4, 6...)
        nextTime: getNextEventTime(2, 0, currentHour, currentMinute)
      },
      {
        name: 'Vua Xuong',
        interval: 2, // Every 2 hours
        duration: 10, // 10 minutes
        startHour: 0, // Starts at even hours + 5 minutes
        offsetMinutes: 5,
        nextTime: getNextEventTime(2, 0, currentHour, currentMinute, 5)
      },
      {
        name: 'Rong Do',
        interval: 1.5, // Every 1.5 hours
        duration: 10, // 10 minutes
        startHour: 1, // Starts at odd hours + 30 minutes
        offsetMinutes: 30,
        nextTime: getNextEventTime(1.5, 1, currentHour, currentMinute, 30)
      }
    ];

    // Find events starting in the next 5 minutes
    const upcomingEvents = events.filter(event => {
      const timeUntilEvent = event.nextTime - (currentHour * 60 + currentMinute);
      return timeUntilEvent <= 5 && timeUntilEvent > 0;
    });

    return NextResponse.json({
      success: true,
      data: upcomingEvents,
      currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
      upcomingCount: upcomingEvents.length
    });

  } catch (error) {
    console.error('Error checking events:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking events',
      data: []
    });
  }
}

function getNextEventTime(intervalHours: number, startHour: number, currentHour: number, currentMinute: number, offsetMinutes: number = 0) {
  const intervalMinutes = intervalHours * 60;
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  
  // Calculate next occurrence
  let nextEventMinutes = startHour * 60 + offsetMinutes;
  
  // Find the next occurrence after current time
  while (nextEventMinutes <= currentTotalMinutes) {
    nextEventMinutes += intervalMinutes;
  }
  
  return nextEventMinutes;
}
