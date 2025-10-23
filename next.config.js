/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // External packages that should not be bundled
  serverExternalPackages: ['@supabase/supabase-js', 'openai'],
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Environment variables for build-time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'placeholder-clerk-key',
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || 'placeholder-posthog-key',
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://placeholder.vercel.app',
  },
  
  // Build-time environment validation
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side environment validation
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
      ];
      
      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName] || process.env[varName].includes('placeholder')
      );
      
      if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
        console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
        console.warn('Using placeholder values for build. Please configure environment variables in Vercel.');
      }
    }
    
    return config;
  },
}

export default nextConfig
