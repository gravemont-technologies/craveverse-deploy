# CraveVerse Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Environment Variables Setup
Create a `.env.local` file in your project root with your actual credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-clerk-key
CLERK_SECRET_KEY=sk_test_your-actual-clerk-secret

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret

# Webhooks (set up after creating webhooks)
CLERK_WEBHOOK_SECRET=whsec_your-clerk-webhook-secret
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Database Setup (Supabase)
Execute these SQL files in your Supabase SQL Editor **in order**:

1. **First**: Run `database/complete-schema.sql` - This creates all tables, indexes, and RLS policies
2. **Second**: Run `database/import-levels.sql` - This populates the levels table with 150 levels (30 per craving type)

### 3. Webhook Setup
Follow the instructions in `WEBHOOK_SETUP.md` to set up:
- Clerk webhook for user sync
- Stripe webhook for payment processing

### 4. Start the Application
```bash
npm run dev
```

Visit `http://localhost:5173` and test the authentication flow.

## 🔧 Detailed Setup Instructions

### Supabase Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Go to SQL Editor** in your Supabase dashboard
3. **Execute the schema**:
   - Copy and paste the contents of `database/complete-schema.sql`
   - Click "Run" to execute
4. **Import level data**:
   - Copy and paste the contents of `database/import-levels.sql` 
   - Click "Run" to execute
5. **Verify tables**:
   - Check that you have tables: `users`, `levels`, `user_progress`, `battles`, `forum_posts`, etc.
   - Check that you have 150 rows in the `levels` table

### Clerk Authentication Setup

1. **Create a Clerk account** at [clerk.com](https://clerk.com)
2. **Create a new application**
3. **Configure authentication**:
   - Add your domain: `localhost:5173` for development
   - Enable social providers if desired (Google, GitHub, etc.)
4. **Get your keys**:
   - Copy the Publishable Key and Secret Key
   - Add them to your `.env.local` file
5. **Set up webhook** (see WEBHOOK_SETUP.md)

### Stripe Payment Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)
2. **Get your API keys**:
   - Copy the Publishable Key and Secret Key from the dashboard
   - Add them to your `.env.local` file
3. **Set up webhook** (see WEBHOOK_SETUP.md)

### OpenAI Setup

1. **Get an OpenAI API key** from [platform.openai.com](https://platform.openai.com)
2. **Add it to your `.env.local` file**
3. **Ensure you have credits** in your OpenAI account

## 🧪 Testing the Application

### 1. Test Authentication Flow
- Visit `http://localhost:5173`
- Click "Sign Up" and create an account
- Verify you're redirected to `/onboarding`
- Complete the onboarding flow
- Verify you're redirected to `/dashboard`

### 2. Test Core Features
- **Dashboard**: Should show user stats and current level
- **Onboarding**: Should allow craving selection and quiz
- **Levels**: Should display available levels for user's craving
- **Battles**: Should allow creating and joining battles
- **Forum**: Should allow creating posts and replies
- **Pricing**: Should show subscription plans

### 3. Test API Endpoints
- `/api/user/profile` - Should return user data
- `/api/onboarding/complete` - Should save onboarding data
- `/api/levels/complete` - Should complete a level
- `/api/battles` - Should create/join battles
- `/api/forum/threads` - Should create forum posts

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that your `.env.local` file has the correct Supabase URL and keys
   - Verify the keys are from your actual Supabase project

2. **"Missing OPENAI_API_KEY environment variable"**
   - Add your OpenAI API key to `.env.local`
   - Ensure the key is valid and has credits

3. **"Clerk publishableKey is invalid"**
   - Check that your Clerk keys are correct
   - Ensure you're using the right environment (test vs live)

4. **Database connection errors**
   - Verify your Supabase URL and keys are correct
   - Check that you've run the database schema

5. **404 errors on sign-in/sign-up**
   - The authentication pages have been created
   - Check that the server is running on port 5173

### Debug Steps

1. **Check environment variables**:
   ```bash
   # In your terminal, verify env vars are loaded
   node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

2. **Check database connection**:
   - Go to Supabase dashboard → Table Editor
   - Verify tables exist and have data

3. **Check authentication**:
   - Open browser dev tools → Network tab
   - Look for failed API calls to Clerk

4. **Check server logs**:
   - Look at the terminal where `npm run dev` is running
   - Check for error messages

## 📋 Verification Checklist

- [ ] Environment variables are set in `.env.local`
- [ ] Supabase database schema is executed
- [ ] Level data is imported (150 levels total)
- [ ] Clerk authentication is configured
- [ ] Stripe keys are set (if using payments)
- [ ] OpenAI API key is set
- [ ] Webhooks are configured (optional for basic testing)
- [ ] Application starts without errors
- [ ] Sign-up/sign-in flow works
- [ ] Dashboard loads with user data
- [ ] Onboarding flow completes
- [ ] All pages load without 404 errors

## 🚀 Next Steps

Once everything is working:

1. **Test all features** systematically
2. **Set up production environment** (Vercel, etc.)
3. **Configure production webhooks**
4. **Set up monitoring and analytics**
5. **Deploy to production**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are correct
3. Ensure database schema is properly executed
4. Check server logs for specific error messages
5. Test each component individually

The application should now be fully functional with authentication, database, and all core features working!
