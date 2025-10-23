// API route for forum upvoting
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';


export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await request.json();

    if (!threadId) {
      return NextResponse.json(
        { error: 'Missing thread ID' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough CraveCoins for upvote
    const upvoteCost = 10; // 10 CraveCoins per upvote
    if (userProfile.cravecoins < upvoteCost) {
      return NextResponse.json(
        { error: 'Insufficient CraveCoins. You need 10 coins to upvote.' },
        { status: 400 }
      );
    }

    // Check if user has already upvoted this thread
    const { data: existingUpvote, error: upvoteCheckError } = await supabaseServer
      .from('forum_upvotes')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('thread_id', threadId)
      .single();

    if (upvoteCheckError && upvoteCheckError.code !== 'PGRST116') {
      console.error('Error checking upvote:', upvoteCheckError);
      return NextResponse.json(
        { error: 'Failed to check upvote status' },
        { status: 500 }
      );
    }

    if (existingUpvote) {
      return NextResponse.json(
        { error: 'You have already upvoted this thread' },
        { status: 400 }
      );
    }

    // Create upvote record
    const { error: upvoteError } = await supabaseServer
      .from('forum_upvotes')
      .insert({
        user_id: userProfile.id,
        thread_id: threadId,
        created_at: new Date().toISOString(),
      });

    if (upvoteError) {
      console.error('Error creating upvote:', upvoteError);
      return NextResponse.json(
        { error: 'Failed to create upvote' },
        { status: 500 }
      );
    }

    // Get current upvote count and increment
    const { data: postData } = await supabaseServer
      .from('forum_posts')
      .select('upvotes')
      .eq('id', threadId)
      .single();

    const { error: updateError } = await supabaseServer
      .from('forum_posts')
      .update({
        upvotes: (postData?.upvotes || 0) + 1,
      })
      .eq('id', threadId);

    if (updateError) {
      console.error('Error updating upvote count:', updateError);
      return NextResponse.json(
        { error: 'Failed to update upvote count' },
        { status: 500 }
      );
    }

    // Deduct CraveCoins from user
    const { error: coinError } = await supabaseServer
      .from('users')
      .update({
        cravecoins: userProfile.cravecoins - upvoteCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (coinError) {
      console.error('Error deducting coins:', coinError);
      return NextResponse.json(
        { error: 'Failed to deduct coins' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabaseServer
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'forum_upvote',
          resource_type: 'forum_post',
          resource_id: threadId,
          metadata: {
            cost: upvoteCost,
            remaining_coins: userProfile.cravecoins - upvoteCost,
          },
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Thread upvoted successfully',
      cost: upvoteCost,
      remainingCoins: userProfile.cravecoins - upvoteCost,
    });
  } catch (error) {
    console.error('Forum upvote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

