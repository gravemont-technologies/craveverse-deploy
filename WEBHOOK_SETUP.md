# Webhook Setup Instructions

## Clerk Webhook Setup

### 1. Create Clerk Webhook
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** in the left sidebar
3. Click **Add Endpoint**
4. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
6. Click **Create**
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Add it to your `.env.local` file as `CLERK_WEBHOOK_SECRET`

### 2. Test the Webhook
- The webhook will automatically sync user data with your Supabase database
- Check your Supabase `users` table to verify user creation/updates

## Stripe Webhook Setup

### 1. Create Stripe Webhook
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
5. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Add it to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`

### 2. Test the Webhook
- Use Stripe CLI to test webhooks locally: `stripe listen --forward-to localhost:5173/api/stripe/webhook`
- Or test in production by creating a test subscription

## Environment Variables to Add

Add these to your `.env.local` file:

```env
# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret_here

# Stripe Webhook  
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

## Webhook Endpoints

The following API routes handle the webhooks:

- `app/api/webhooks/clerk/route.ts` - Handles Clerk user events
- `app/api/stripe/webhook/route.ts` - Handles Stripe payment events

## Security Notes

- Webhooks use signature verification for security
- Never expose webhook secrets in client-side code
- Test webhooks in development before deploying to production
- Monitor webhook delivery in your dashboard for any failures
