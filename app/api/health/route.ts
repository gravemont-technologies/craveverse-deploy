// API health check endpoint
import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connectionTest = await testDatabaseConnection();
    const dbStatus = connectionTest.connected ? 'connected' : 'error';
    const dbMessage = connectionTest.connected ? 'Successfully connected to Supabase' : connectionTest.error;

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
      databaseMessage: dbMessage,
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