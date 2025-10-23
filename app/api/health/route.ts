import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    const { data: dbCheck, error: dbError } = await supabaseClient
      .from('users')
      .select('id')
      .limit(1);
    
    const dbStatus = dbError ? 'error' : 'healthy';
    const dbResponseTime = Date.now() - startTime;
    
    // Check environment variables
    const envStatus = {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      posthog: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    };
    
    const allEnvVarsPresent = Object.values(envStatus).every(Boolean);
    
    // Overall health status
    const isHealthy = dbStatus === 'healthy' && allEnvVarsPresent;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError?.message || null,
        },
        environment: {
          status: allEnvVarsPresent ? 'configured' : 'missing_variables',
          variables: envStatus,
        },
      },
      performance: {
        responseTime: Date.now() - startTime,
        memory: process.memoryUsage(),
      },
    };
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    };
    
    return NextResponse.json(errorData, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  }
}
