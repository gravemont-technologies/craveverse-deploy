// Stripe webhook handler for subscription events
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-client';
import Stripe from 'stripe';


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

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes('placeholder')) {
    throw new Error('Stripe webhook secret not configured');
  }
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      const stripe = getStripeClient();
      const webhookSecret = getWebhookSecret();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      
      // Handle Stripe configuration errors
      if (err instanceof Error && err.message.includes('not configured')) {
        return NextResponse.json(
          { error: 'Payment service not configured' },
          { status: 503 }
        );
      }
      
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId) {
    console.error('Missing user_id or plan_id in checkout session metadata');
    return;
  }

  // Update user's subscription status
  const { error } = await supabaseServer
    .from('users')
    .update({
      plan_id: planId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user plan:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const planId = subscription.metadata?.plan_id;

  if (!userId || !planId) {
    console.error('Missing user_id or plan_id in subscription metadata');
    return;
  }

  // Create subscription record
  const { error } = await supabaseServer
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    });

  if (error) {
    console.error('Error creating subscription record:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { error } = await supabaseServer
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription status to cancelled
  const { error } = await supabaseServer
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }

  // Downgrade user to free plan
  const { data: subscriptionData } = await supabaseServer
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subscriptionData) {
    const { error: userError } = await supabaseServer
      .from('users')
      .update({
        plan_id: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionData.user_id);

    if (userError) {
      console.error('Error downgrading user:', userError);
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  const { error } = await supabaseServer
    .from('transactions')
    .insert({
      user_id: invoice.metadata?.user_id,
      type: 'subscription',
      amount: invoice.amount_paid / 100, // Convert from cents
      stripe_session_id: invoice.id,
      status: 'completed',
    });

  if (error) {
    console.error('Error logging successful payment:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Log failed payment
  const { error } = await supabaseServer
    .from('transactions')
    .insert({
      user_id: invoice.metadata?.user_id,
      type: 'subscription',
      amount: invoice.amount_due / 100, // Convert from cents
      stripe_session_id: invoice.id,
      status: 'failed',
    });

  if (error) {
    console.error('Error logging failed payment:', error);
  }
}

