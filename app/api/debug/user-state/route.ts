// Temporary debug endpoint to diagnose user state issues
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No user authenticated',
        clerkUserId: null,
        supabaseUser: null,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Debug: Checking user state for Clerk ID: ${userId}`);

    // Get user from Supabase
    const { data: supabaseUser, error: supabaseError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    const debugInfo = {
      clerkUserId: userId,
      supabaseUser: supabaseUser,
      supabaseError: supabaseError,
      hasUser: !!supabaseUser,
      hasPrimaryCraving: !!supabaseUser?.primary_craving,
      primaryCravingValue: supabaseUser?.primary_craving,
      userCreatedAt: supabaseUser?.created_at,
      userUpdatedAt: supabaseUser?.updated_at,
      timestamp: new Date().toISOString()
    };

    console.log('Debug user state:', debugInfo);

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
