// API route for creating Stripe checkout sessions
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import Stripe from 'stripe';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';
import { PRICING_TIERS } from '../../../../lib/config';


// Lazy Stripe client initialization
function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('sk_test_')) {
    throw new Error('Stripe API key not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing price ID' },
        { status: 400 }
      );
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription, error: subError } = await supabaseServer
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', userProfile.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Get pricing tier info
    const tier = Object.values(PRICING_TIERS).find((t: any) => t.id === priceId);
    if (!tier || (tier as any).id === 'free') {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      );
    }

    // Initialize Stripe client
    const stripe = getStripeClient();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userProfile.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: (tier as any).name,
              description: `CraveVerse ${(tier as any).name} Plan`,
            },
            unit_amount: Math.round((tier as any).price_monthly_usd * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
      metadata: {
        user_id: userProfile.id,
        plan_id: (tier as any).id,
      },
      subscription_data: {
        metadata: {
          user_id: userProfile.id,
          plan_id: (tier as any).id,
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    
    // Handle Stripe configuration errors
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

