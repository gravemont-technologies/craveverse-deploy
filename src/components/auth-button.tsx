"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, LogIn, UserPlus } from 'lucide-react'

export function AuthButton() {
  const [isOpen, setIsOpen] = useState(false)
  // TODO: Replace with actual Clerk authentication state
  const isAuthenticated = false

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <LogIn className="h-4 w-4 mr-2" />
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to CraveVerse</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Join thousands of users building meaningful relationships with AI-powered insights.
          </p>
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
