// Middleware for authentication and rate limiting
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { rateLimiters } from './lib/rate-limiter';

// Check if we're in build phase - skip Clerk middleware during build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/stripe/webhook',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/workspace(.*)',
  '/battles(.*)',
  '/forum(.*)',
  '/upgrade(.*)',
  '/admin(.*)',
  '/api/levels(.*)',
  '/api/battles(.*)',
  '/api/forum(.*)',
  '/api/ai(.*)',
  '/api/stripe(.*)',
]);

// Skip Clerk middleware during build time
export default isBuildTime 
  ? () => NextResponse.next()
  : clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

// Rate limiting middleware for API routes
export async function rateLimitMiddleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Get user ID from request headers (set by Clerk)
  const userId = request.headers.get('x-user-id');
  const userTier = request.headers.get('x-user-tier') as 'free' | 'plus' | 'ultra' || 'free';
  
  // Apply rate limiting based on endpoint
  if (pathname.startsWith('/api/levels/complete')) {
    const limiter = rateLimiters.apiMutations;
    const result = await limiter.checkLimit(userId || 'anonymous');
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter['config'].requests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }
  }
  
  if (pathname.startsWith('/api/ai/')) {
    // Check AI call limits based on user tier
    const aiLimiter = rateLimiters.aiCalls;
    aiLimiter['config'].requests = getAIRateLimit(userTier);
    
    const result = await aiLimiter.checkLimit(userId || 'anonymous');
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'AI rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': aiLimiter['config'].requests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }
  }
  
  return NextResponse.next();
}

// Helper function to get AI rate limit based on tier
function getAIRateLimit(tier: 'free' | 'plus' | 'ultra'): number {
  const limits = {
    free: 10,
    plus: 50,
    ultra: 999,
  };
  return limits[tier];
}
