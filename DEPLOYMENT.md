# CraveVerse Vercel Deployment Guide

This guide covers deploying CraveVerse to Vercel with production-ready configuration.

## 🚀 Quick Deploy to Vercel

### Step 1: Prepare Your Repository

1. **Ensure your code is ready:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Verify build works locally:**
   ```bash
   npm run build
   npm run start
   ```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login with GitHub**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Vercel will auto-detect Next.js**
6. **Click "Deploy"**

### Step 3: Configure Environment Variables

In your Vercel dashboard → Settings → Environment Variables, add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-publishable-key
CLERK_SECRET_KEY=sk_live_your-secret-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### Step 4: Configure Webhooks

**After getting your Vercel URL, configure webhooks:**

#### Clerk Webhook
- **URL**: `https://your-app-name.vercel.app/api/webhooks/clerk`
- **Events**: `user.created`, `user.updated`, `user.deleted`
- **Secret**: Use a strong secret key

#### Stripe Webhook
- **URL**: `https://your-app-name.vercel.app/api/stripe/webhook`
- **Events**: 
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## 🔧 Production Setup

### Database Configuration

1. **Create Production Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project for production
   - Choose region closest to your users
   - Set strong database password

2. **Run Production Schema:**
   ```sql
   -- Copy and run the contents of database/complete-schema.sql
   -- This includes all tables, relationships, and RLS policies
   ```

3. **Configure Storage:**
   - Create `files` bucket for user uploads
   - Set appropriate file size limits
   - Configure storage policies

### Authentication Setup

1. **Create Production Clerk Application:**
   - Go to [clerk.com](https://clerk.com)
   - Create new application for production
   - Configure production domains
   - Set up OAuth providers

2. **Configure Webhooks:**
   - Add webhook endpoint for user events
   - Test webhook delivery
   - Set up retry policies

### Payment Setup

1. **Create Production Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Switch to live mode
   - Get live API keys
   - Configure webhooks

2. **Set Up Products:**
   - Create subscription products
   - Configure pricing tiers
   - Set up tax rates

### AI Configuration

1. **OpenAI Setup:**
   - Get production API key
   - Set usage limits
   - Configure monitoring
   - Set up cost alerts

2. **Cost Controls:**
   - Set monthly budget limits
   - Configure per-user limits
   - Set up fallback templates

## 📊 Monitoring & Health Checks

### Health Check Endpoint

The application includes a health check at `/api/health` that verifies:
- Database connectivity
- External service status
- System health metrics

### Monitoring Setup

1. **PostHog Production:**
   - Create production project
   - Configure data retention
   - Set up alerts and dashboards

2. **Error Monitoring:**
   - Consider adding Sentry for error tracking
   - Set up log aggregation
   - Configure alerting

## 🔒 Security Configuration

### Environment Security

- **Never commit `.env` files**
- **Use different keys for dev/prod**
- **Rotate keys regularly**
- **Use secure key management**

### Database Security

- **Enable Row Level Security (RLS)**
- **Use strong database passwords**
- **Configure IP restrictions**
- **Set up automated backups**

### Application Security

- **Enable rate limiting**
- **Configure CORS properly**
- **Set up security headers**
- **Monitor for suspicious activity**

## 🚀 Performance Optimization

### Vercel Configuration

The project includes `vercel.json` with:
- Optimized build settings
- Function timeout configuration
- Edge caching configuration

### Next.js Optimizations

- **Image optimization** enabled
- **Static generation** where possible
- **API route optimization**
- **Bundle size optimization**

### Database Optimization

- **Connection pooling**
- **Query optimization**
- **Indexing strategy**
- **Caching layer**

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys on:
- Push to `main` branch
- Pull request creation
- Manual deployment triggers

### Pre-deployment Checks

- **Build verification**
- **Type checking**
- **Linting**
- **Test execution** (if configured)

## 📈 Scaling Considerations

### Database Scaling

- **Monitor query performance**
- **Set up read replicas**
- **Configure connection pooling**
- **Plan for data archiving**

### Application Scaling

- **Monitor function execution**
- **Set up auto-scaling**
- **Configure load balancing**
- **Monitor resource usage**

### Cost Management

- **Monitor AI usage costs**
- **Set up budget alerts**
- **Optimize function execution**
- **Review subscription tiers**

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors
   - Review environment variables

2. **Database Connection Issues:**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Verify network connectivity
   - Review connection limits

3. **Authentication Issues:**
   - Verify Clerk keys and configuration
   - Check redirect URLs
   - Verify webhook configuration
   - Review user permissions

4. **Payment Issues:**
   - Verify Stripe keys and webhooks
   - Check product configuration
   - Review webhook event handling
   - Test payment flows

### Debugging Steps

1. **Check Vercel Function Logs:**
   - Go to Vercel dashboard
   - Navigate to Functions tab
   - Review execution logs
   - Check error messages

2. **Verify Environment Variables:**
   - Check all required variables are set
   - Verify values are correct
   - Test with different environments

3. **Test API Endpoints:**
   - Use health check endpoint
   - Test individual API routes
   - Verify database connectivity
   - Check external service integration

### Getting Help

- **Check Vercel documentation**
- **Review Next.js deployment guide**
- **Check service-specific documentation**
- **Contact support if needed**

## 📋 Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Authentication works (sign up/sign in)
- [ ] Database operations work
- [ ] Payment processing works
- [ ] AI features function correctly
- [ ] Webhooks are configured and working
- [ ] Health check endpoint responds
- [ ] Monitoring is set up
- [ ] Error tracking is configured
- [ ] Performance is acceptable
- [ ] Security measures are in place

## 🔄 Rollback Procedures

### Quick Rollback

1. **Go to Vercel dashboard**
2. **Navigate to Deployments**
3. **Select previous working deployment**
4. **Click "Promote to Production"**

### Database Rollback

1. **Use Supabase point-in-time recovery**
2. **Restore from backup**
3. **Verify data integrity**
4. **Test application functionality**

---

Happy deploying! 🚀

For additional support, check the [README.md](README.md) or create an issue in the repository.