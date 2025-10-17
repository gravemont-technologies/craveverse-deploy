import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react'

// Mock data - TODO: Replace with actual data from Supabase
const activities = [
  {
    id: '1',
    type: 'analysis_completed',
    title: 'Relationship analysis completed',
    description: 'conversation_analysis.txt has been processed',
    timestamp: '2 hours ago',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: '2',
    type: 'insight_generated',
    title: 'New insight available',
    description: 'Communication pattern detected in your recent interactions',
    timestamp: '4 hours ago',
    status: 'success',
    icon: TrendingUp,
  },
  {
    id: '3',
    type: 'file_uploaded',
    title: 'File uploaded',
    description: 'relationship_insights.pdf is being processed',
    timestamp: '6 hours ago',
    status: 'processing',
    icon: FileText,
  },
  {
    id: '4',
    type: 'relationship_updated',
    title: 'Relationship status updated',
    description: 'Connection with Sarah improved to "Strong"',
    timestamp: '1 day ago',
    status: 'success',
    icon: Users,
  },
  {
    id: '5',
    type: 'analysis_failed',
    title: 'Analysis failed',
    description: 'communication_patterns.json could not be processed',
    timestamp: '2 days ago',
    status: 'error',
    icon: AlertCircle,
  },
]

const statusConfig = {
  completed: { label: 'Completed', variant: 'default' as const, color: 'text-green-600' },
  success: { label: 'Success', variant: 'default' as const, color: 'text-green-600' },
  processing: { label: 'Processing', variant: 'secondary' as const, color: 'text-blue-600' },
  error: { label: 'Error', variant: 'destructive' as const, color: 'text-red-600' },
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const status = statusConfig[activity.status as keyof typeof statusConfig]
            const Icon = activity.icon
            
            return (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className={`h-4 w-4 ${status.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{activity.title}</h4>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
