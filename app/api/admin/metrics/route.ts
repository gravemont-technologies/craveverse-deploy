// API route for admin metrics
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';


export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile || userProfile.plan_id !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get total users
    const { count: totalUsers, error: totalUsersError } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalUsersError) {
      console.error('Error fetching total users:', totalUsersError);
      return NextResponse.json(
        { error: 'Failed to fetch user metrics' },
        { status: 500 }
      );
    }

    // Get active users (users who have logged in within the timeframe)
    const { count: activeUsers, error: activeUsersError } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', startDate.toISOString());

    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError);
      return NextResponse.json(
        { error: 'Failed to fetch active user metrics' },
        { status: 500 }
      );
    }

    // Get revenue data
    const { data: revenueData, error: revenueError } = await supabaseServer
      .from('transactions')
      .select('amount, created_at')
      .eq('status', 'completed')
      .eq('type', 'subscription');

    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue metrics' },
        { status: 500 }
      );
    }

    const totalRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
    const monthlyRevenue = revenueData?.filter(transaction => 
      new Date(transaction.created_at) >= startDate
    ).reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

    // Get AI costs
    const { data: aiUsageData, error: aiUsageError } = await supabaseServer
      .from('ai_usage_log')
      .select('cost_usd, created_at')
      .gte('created_at', startDate.toISOString());

    if (aiUsageError) {
      console.error('Error fetching AI usage data:', aiUsageError);
      return NextResponse.json(
        { error: 'Failed to fetch AI cost metrics' },
        { status: 500 }
      );
    }

    const aiCosts = aiUsageData?.reduce((sum, usage) => sum + usage.cost_usd, 0) || 0;
    const aiCostPerUser = (totalUsers && totalUsers > 0) ? aiCosts / totalUsers : 0;

    // Get user tier distribution
    const { data: userTiersData, error: userTiersError } = await supabaseServer
      .from('users')
      .select('plan_id')
      .not('plan_id', 'is', null);

    if (userTiersError) {
      console.error('Error fetching user tiers:', userTiersError);
      return NextResponse.json(
        { error: 'Failed to fetch user tier metrics' },
        { status: 500 }
      );
    }

    const tierCounts = userTiersData?.reduce((acc, user) => {
      const tier = user.plan_id || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const userTiers = Object.entries(tierCounts).map(([tier, count]) => ({
      tier,
      count,
      percentage: (totalUsers && totalUsers > 0) ? Math.round((count / totalUsers) * 100) : 0,
    }));

    // Get top AI features
    const { data: topFeaturesData, error: topFeaturesError } = await supabaseServer
      .from('ai_usage_log')
      .select('feature')
      .gte('created_at', startDate.toISOString());

    if (topFeaturesError) {
      console.error('Error fetching top features:', topFeaturesError);
      return NextResponse.json(
        { error: 'Failed to fetch feature metrics' },
        { status: 500 }
      );
    }

    const featureCounts = topFeaturesData?.reduce((acc, usage) => {
      const feature = usage.feature || 'unknown';
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topFeatures = Object.entries(featureCounts)
      .map(([name, usage]) => ({ name, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    // Get recent activity
    const { data: recentActivityData, error: recentActivityError } = await supabaseServer
      .from('activity_log')
      .select('action, user_id, created_at, users!inner(name)')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentActivityError) {
      console.error('Error fetching recent activity:', recentActivityError);
      return NextResponse.json(
        { error: 'Failed to fetch activity metrics' },
        { status: 500 }
      );
    }

    const recentActivity = recentActivityData?.map(activity => ({
      action: activity.action.replace('_', ' '),
      user: (activity.users as any)?.name,
      timestamp: new Date(activity.created_at).toLocaleDateString(),
    })) || [];

    // Calculate conversion and churn rates (simplified)
    const conversionRate = 0.12; // Placeholder - would need more complex calculation
    const churnRate = 0.05; // Placeholder - would need more complex calculation

    const metrics = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRevenue,
      monthlyRevenue,
      aiCosts,
      aiCostPerUser,
      conversionRate,
      churnRate,
      topFeatures,
      userTiers,
      recentActivity,
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

