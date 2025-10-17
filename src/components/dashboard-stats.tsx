import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Users, TrendingUp, Clock } from 'lucide-react'

const stats = [
  {
    title: 'Total Relationships',
    value: '12',
    change: '+3 this month',
    icon: Users,
    description: 'Active connections tracked',
  },
  {
    title: 'Insights Generated',
    value: '48',
    change: '+12 this week',
    icon: TrendingUp,
    description: 'AI-powered recommendations',
  },
  {
    title: 'Files Analyzed',
    value: '24',
    change: '+8 this month',
    icon: Upload,
    description: 'Documents processed',
  },
  {
    title: 'Time Saved',
    value: '16h',
    change: '+4h this week',
    icon: Clock,
    description: 'Efficiency gains',
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stat.change}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
