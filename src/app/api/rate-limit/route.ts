import { NextRequest, NextResponse } from 'next/server';

// In-memory store cho rate limiting (trong production nên dùng Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { ip, action } = await request.json();
    
    if (action === 'check') {
      const attempts = loginAttempts.get(ip);
      
      if (!attempts) {
        return NextResponse.json({ 
          allowed: true, 
          remaining: MAX_ATTEMPTS 
        });
      }
      
      const now = Date.now();
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      
      // Reset if 24 hours have passed
      if (timeSinceLastAttempt > WINDOW_MS) {
        loginAttempts.delete(ip);
        return NextResponse.json({ 
          allowed: true, 
          remaining: MAX_ATTEMPTS 
        });
      }
      
      const remaining = Math.max(0, MAX_ATTEMPTS - attempts.count);
      
      return NextResponse.json({ 
        allowed: attempts.count < MAX_ATTEMPTS,
        remaining,
        resetTime: attempts.lastAttempt + WINDOW_MS
      });
    }
    
    if (action === 'increment') {
      const attempts = loginAttempts.get(ip);
      const now = Date.now();
      
      if (!attempts) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
      } else {
        const timeSinceLastAttempt = now - attempts.lastAttempt;
        
        // Reset if 24 hours have passed
        if (timeSinceLastAttempt > WINDOW_MS) {
          loginAttempts.set(ip, { count: 1, lastAttempt: now });
        } else {
          attempts.count += 1;
          attempts.lastAttempt = now;
        }
      }
      
      const currentAttempts = loginAttempts.get(ip)!;
      const remaining = Math.max(0, MAX_ATTEMPTS - currentAttempts.count);
      
      return NextResponse.json({ 
        allowed: currentAttempts.count <= MAX_ATTEMPTS,
        remaining,
        resetTime: currentAttempts.lastAttempt + WINDOW_MS
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Rate limit error:', error);
    return NextResponse.json({ 
      error: 'Rate limit check failed' 
    }, { status: 500 });
  }
}

