// Clerk authentication configuration
import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'

// Get Clerk configuration from environment variables
export const clerkConfig = {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || 'pk_test_your-key',
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_your-secret-key',
}

// Auth helpers
export const authHelpers = {
  // Get current user
  async getCurrentUser() {
    // TODO: Implement with actual Clerk user fetching
    // const { user } = useUser()
    // return user
    return null
  },

  // Check if user is authenticated
  async isAuthenticated() {
    // TODO: Implement with actual Clerk auth check
    // const { isSignedIn } = useAuth()
    // return isSignedIn
    return false
  },

  // Get user ID
  async getUserId() {
    // TODO: Implement with actual Clerk user ID
    // const { userId } = useAuth()
    // return userId
    return null
  },

  // Sign out
  async signOut() {
    // TODO: Implement with actual Clerk sign out
    // const { signOut } = useAuth()
    // await signOut()
    console.log('Sign out (stub)')
  }
}

// User profile operations
export const userOperations = {
  // Get user profile
  async getProfile(userId: string) {
    // TODO: Implement with actual Clerk user profile fetching
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null,
      createdAt: new Date().toISOString(),
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Record<string, any>) {
    // TODO: Implement with actual Clerk user profile updates
    console.log('Update profile (stub):', userId, updates)
  },

  // Delete user account
  async deleteAccount(userId: string) {
    // TODO: Implement with actual Clerk account deletion
    console.log('Delete account (stub):', userId)
  }
}

// Auth middleware for protected routes
export const authMiddleware = {
  // Protect API routes
  async protectApiRoute(req: Request) {
    // TODO: Implement with actual Clerk auth middleware
    // const { userId } = getAuth(req)
    // if (!userId) {
    //   return new Response('Unauthorized', { status: 401 })
    // }
    // return userId
    return 'stub-user-id'
  },

  // Protect page routes
  async protectPage() {
    // TODO: Implement with actual Clerk auth middleware
    // const { userId } = auth()
    // if (!userId) {
    //   redirect('/sign-in')
    // }
    // return userId
    return 'stub-user-id'
  }
}

// Export Clerk provider wrapper
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TODO: Implement Clerk provider when needed
  return React.createElement(React.Fragment, null, children)
}
