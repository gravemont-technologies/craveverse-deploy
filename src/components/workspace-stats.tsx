import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Clock, CheckCircle, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Total Uploads',
    value: '24',
    change: '+12%',
    icon: Upload,
    description: 'Files uploaded this month',
  },
  {
    title: 'In Review',
    value: '3',
    change: '-2',
    icon: Clock,
    description: 'Currently processing',
  },
  {
    title: 'Completed',
    value: '18',
    change: '+8',
    icon: CheckCircle,
    description: 'Successfully analyzed',
  },
  {
    title: 'Success Rate',
    value: '94%',
    change: '+5%',
    icon: TrendingUp,
    description: 'Analysis accuracy',
  },
]

export function WorkspaceStats() {
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
              <span className="text-green-600">{stat.change}</span> {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
