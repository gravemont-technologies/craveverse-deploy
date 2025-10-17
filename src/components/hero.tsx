"use client"

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react'
import { AuthButton } from '@/components/auth-button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Relationship Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Build Meaningful Relationships with{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Insights
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform how you approach relationships — from reactive and emotional to strategic, 
            measurable, and growth-oriented with AI-driven behavioral insights.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Building Better Relationships
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <AuthButton />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">95% Success Rate</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}
