# CraveVerse Deployment Guide

This guide covers deploying CraveVerse to various platforms and environments.

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: Deploy from GitHub

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project
   - Add your environment variables
   - Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add NEXT_PUBLIC_POSTHOG_KEY
   vercel env add NEXT_PUBLIC_POSTHOG_HOST
   ```

## 🌐 Other Deployment Platforms

### Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `.next` folder
   - Or connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

### AWS Amplify

1. **Connect GitHub repository:**
   - Go to [aws.amazon.com/amplify](https://aws.amazon.com/amplify)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the main branch

2. **Configure build settings:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

3. **Add environment variables:**
   - Go to "Environment variables" in Amplify console
   - Add all required environment variables

### Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your-url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   # ... add all other variables
   ```

### DigitalOcean App Platform

1. **Create a new app:**
   - Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure the app:**
   - Set build command: `npm run build`
   - Set run command: `npm start`
   - Set source directory: `/`
   - Set output directory: `.next`

3. **Add environment variables:**
   - Go to "Settings" → "Environment Variables"
   - Add all required variables

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Use the official Node.js image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and run with Docker

```bash
# Build the Docker image
docker build -t craveverse .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key \
  -e CLERK_SECRET_KEY=your-secret \
  craveverse
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Clerk
CLERK_PUBLISHABLE_KEY=pk_live_your-publishable-key
CLERK_SECRET_KEY=sk_live_your-secret-key

# PostHog (Optional)
POSTHOG_KEY=phc_your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# Application
APP_URL=https://your-domain.com
APP_NAME=CraveVerse
```

### Production vs Development

**Development:**
- Use `pk_test_` keys for Clerk
- Use `sk_test_` keys for Clerk
- Use development Supabase project
- Use development PostHog project

**Production:**
- Use `pk_live_` keys for Clerk
- Use `sk_live_` keys for Clerk
- Use production Supabase project
- Use production PostHog project

## 🗄️ Database Setup for Production

### Supabase Production Setup

1. **Create Production Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project for production
   - Choose a region close to your users
   - Set a strong database password

2. **Run Production Schema:**
   - Copy the contents of `database/schema.sql`
   - Run it in your production Supabase project
   - Verify all tables and policies are created

3. **Configure Storage:**
   - Ensure the `files` bucket is created
   - Set appropriate storage policies
   - Configure file size limits

4. **Set Up Backups:**
   - Enable automatic backups
   - Set up point-in-time recovery
   - Configure backup retention

### Clerk Production Setup

1. **Create Production Application:**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application for production
   - Configure production domains

2. **Set Up Authentication:**
   - Configure OAuth providers
   - Set up email templates
   - Configure session settings

3. **Security Settings:**
   - Enable rate limiting
   - Configure session timeouts
   - Set up security policies

## 📊 Monitoring and Analytics

### PostHog Production Setup

1. **Create Production Project:**
   - Go to [posthog.com](https://posthog.com)
   - Create a new project for production
   - Configure data retention

2. **Set Up Monitoring:**
   - Configure alerts
   - Set up dashboards
   - Monitor key metrics

### Error Monitoring

Consider adding error monitoring:

```bash
# Install Sentry
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` or `.env.production`
- Use different keys for development and production
- Rotate keys regularly
- Use secure key management

### Database Security
- Enable Row Level Security (RLS)
- Use strong database passwords
- Configure IP restrictions
- Set up database backups

### Authentication Security
- Use strong session secrets
- Configure session timeouts
- Enable rate limiting
- Set up security policies

## 🚀 Performance Optimization

### Next.js Optimizations

1. **Enable Image Optimization:**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-domain.com'],
     },
   };
   ```

2. **Enable Compression:**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
   };
   ```

3. **Configure Caching:**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ];
     },
   };
   ```

### CDN Configuration

- Use a CDN for static assets
- Configure proper cache headers
- Enable gzip compression
- Set up image optimization

## 📈 Scaling Considerations

### Database Scaling
- Monitor database performance
- Set up read replicas
- Configure connection pooling
- Plan for data archiving

### Application Scaling
- Use horizontal scaling
- Configure load balancing
- Set up auto-scaling
- Monitor resource usage

### File Storage Scaling
- Use CDN for file delivery
- Implement file compression
- Set up automatic cleanup
- Monitor storage usage

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version
   - Clear cache and reinstall
   - Verify environment variables

2. **Database Connection Issues:**
   - Check Supabase URL and keys
   - Verify database is accessible
   - Check RLS policies

3. **Authentication Issues:**
   - Verify Clerk keys
   - Check redirect URLs
   - Verify domain configuration

4. **Performance Issues:**
   - Monitor database queries
   - Check CDN configuration
   - Optimize images and assets

### Getting Help

- Check the application logs
- Monitor error tracking
- Review performance metrics
- Contact support if needed

---

Happy deploying! 🚀
