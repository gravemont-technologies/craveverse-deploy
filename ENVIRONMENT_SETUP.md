# 🔧 Environment Setup Guide

## Current Status
Your CraveVerse application is working perfectly, but Clerk is running in "keyless mode" because environment variables need to be configured.

## Quick Setup

### 1. Create Environment File
Copy the example file to create your local environment configuration:

```bash
cp env.example .env.local
```

### 2. Configure Clerk Authentication

#### Option A: Use Clerk's Keyless Mode (Current)
- Your app is already working in keyless mode
- Perfect for development and testing
- No additional setup required

#### Option B: Set Up Clerk Account (Recommended for Production)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your API keys to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-key-here
CLERK_SECRET_KEY=sk_test_your-actual-secret-key-here
```

### 3. Configure Other Services (Optional)

#### Supabase (Database)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

#### OpenAI (AI Features)
1. Get API key from [OpenAI](https://platform.openai.com)
2. Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your-actual-openai-key
```

#### Stripe (Payments)
1. Get keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
```

## Current Working Configuration

Your application is currently working with:
- ✅ **Next.js server** running on `http://localhost:5173`
- ✅ **Clerk keyless mode** for authentication
- ✅ **All features functional** (except external API integrations)
- ✅ **Vite conflicts resolved** with cleanup scripts

## Development vs Production

### Development (Current)
- Clerk keyless mode works perfectly
- All core features are functional
- No external API keys required
- Perfect for testing and development

### Production
- Set up actual Clerk account
- Configure Supabase database
- Add OpenAI API key for AI features
- Set up Stripe for payments

## Next Steps

1. **For immediate development**: Your app is ready to use as-is
2. **For production deployment**: Follow the service setup steps above
3. **For testing**: Use the current keyless mode configuration

## Troubleshooting

If you encounter issues:
1. Restart the development server: `npm run dev`
2. Check that `.env.local` exists and has the correct format
3. Ensure no syntax errors in environment variables

---
*Your CraveVerse application is fully functional and ready for development!*
