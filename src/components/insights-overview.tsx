import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart,
  ArrowRight,
  AlertTriangle
} from 'lucide-react'

// Mock data - TODO: Replace with actual data from Supabase
const insights = [
  {
    id: '1',
    type: 'communication',
    title: 'Communication Style Analysis',
    description: 'Your communication has become 23% more empathetic over the past month.',
    impact: 'positive',
    confidence: 87,
    icon: MessageSquare,
  },
  {
    id: '2',
    type: 'relationship',
    title: 'Relationship Health Score',
    description: 'Your relationship with Sarah has improved significantly. Consider scheduling regular check-ins.',
    impact: 'positive',
    confidence: 92,
    icon: Heart,
  },
  {
    id: '3',
    type: 'pattern',
    title: 'Interaction Pattern Detected',
    description: 'You tend to be more responsive in the morning. Consider adjusting your communication schedule.',
    impact: 'neutral',
    confidence: 74,
    icon: TrendingUp,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Attention Required',
    description: 'Your response time has increased by 40% this week. This might affect relationship quality.',
    impact: 'negative',
    confidence: 68,
    icon: AlertTriangle,
  },
]

const impactConfig = {
  positive: { 
    label: 'Positive', 
    variant: 'default' as const, 
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950'
  },
  neutral: { 
    label: 'Neutral', 
    variant: 'secondary' as const, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  negative: { 
    label: 'Attention', 
    variant: 'destructive' as const, 
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950'
  },
}

export function InsightsOverview() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Insights</CardTitle>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => {
            const impact = impactConfig[insight.impact as keyof typeof impactConfig]
            const Icon = insight.icon
            
            return (
              <div 
                key={insight.id} 
                className={`p-4 rounded-lg border ${impact.bgColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-background">
                      <Icon className={`h-5 w-5 ${impact.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={impact.variant} className="text-xs">
                        {impact.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-muted-foreground">
                          Confidence: {insight.confidence}%
                        </div>
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
