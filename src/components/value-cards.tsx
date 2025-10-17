import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, BarChart3, Shield } from 'lucide-react'

const benefits = [
  {
    icon: Brain,
    title: 'AI-Driven Insights',
    description: 'Get personalized recommendations based on communication patterns and behavioral analysis.',
  },
  {
    icon: BarChart3,
    title: 'Data Visualization',
    description: 'Understand relationship dynamics through intuitive charts and progress tracking.',
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'Your data is encrypted and secure. We never share your personal insights with third parties.',
  },
]

export function ValueCards() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose CraveVerse?
          </h2>
          <p className="text-lg text-muted-foreground">
            Transform your relationships with intelligent insights and actionable guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
