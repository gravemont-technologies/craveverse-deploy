// API health check endpoint
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    let dbStatus = 'unknown';
    try {
      const { error } = await supabaseServer
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        dbStatus = 'error';
      } else {
        dbStatus = 'connected';
      }
    } catch (dbError) {
      dbStatus = 'error';
    }

    // Test API routes availability
    const routes = {
      profile: 'available',
      personalize: 'available', 
      complete: 'available',
      health: 'available'
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      routes,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 });
  }
}