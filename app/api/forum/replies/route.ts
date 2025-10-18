// API route for forum replies
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '../../../../lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';

const supabase = supabaseServer;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId, content, parentReplyId } = await request.json();

    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if thread exists
    const { data: thread, error: threadError } = await supabase
      .from('forum_posts')
      .select('id, status')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.status !== 'active') {
      return NextResponse.json({ error: 'Thread is not active' }, { status: 400 });
    }

    // Check if user can create replies (rate limiting)
    const { data: recentReplies, error: recentError } = await supabase
      .from('forum_replies')
      .select('id')
      .eq('user_id', userProfile.id)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

    if (recentError) {
      console.error('Error checking recent replies:', recentError);
    }

    const hourlyLimit = userProfile.subscription_tier === 'free' ? 5 : 20;
    if (recentReplies && recentReplies.length >= hourlyLimit) {
      return NextResponse.json(
        { error: `Hourly reply limit reached. You can post ${hourlyLimit} replies per hour.` },
        { status: 429 }
      );
    }

    // Create reply
    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .insert({
        post_id: threadId,
        user_id: userProfile.id,
        content: content.trim(),
        parent_reply_id: parentReplyId || null,
        upvotes: 0,
        ai_generated: false,
      })
      .select(`
        id,
        content,
        upvotes,
        created_at,
        ai_generated,
        parent_reply_id,
        users!inner (
          name,
          avatar_url,
          subscription_tier
        )
      `)
      .single();

    if (replyError) {
      console.error('Error creating reply:', replyError);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'forum_reply_created',
          resource_type: 'forum_reply',
          resource_id: reply.id,
          metadata: {
            thread_id: threadId,
            parent_reply_id: parentReplyId,
          },
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      reply: {
        id: reply.id,
        content: reply.content,
        author_name: (reply.users as any)?.name,
        author_avatar: (reply.users as any)?.avatar_url,
        author_tier: (reply.users as any)?.subscription_tier,
        upvotes: reply.upvotes,
        created_at: reply.created_at,
        ai_generated: reply.ai_generated,
        parent_reply_id: reply.parent_reply_id,
      },
    });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

