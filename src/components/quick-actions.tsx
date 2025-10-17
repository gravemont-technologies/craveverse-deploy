import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  FileText, 
  Settings, 
  HelpCircle,
  BarChart3,
  Users
} from 'lucide-react'

const actions = [
  {
    title: 'Upload New File',
    description: 'Analyze communication patterns',
    icon: Upload,
    href: '/workspace',
    variant: 'default' as const,
  },
  {
    title: 'View Insights',
    description: 'Check your latest analysis',
    icon: BarChart3,
    href: '/insights',
    variant: 'outline' as const,
  },
  {
    title: 'Manage Relationships',
    description: 'Update connection status',
    icon: Users,
    href: '/relationships',
    variant: 'outline' as const,
  },
  {
    title: 'Settings',
    description: 'Configure your preferences',
    icon: Settings,
    href: '/settings',
    variant: 'ghost' as const,
  },
  {
    title: 'Get Help',
    description: 'Learn how to use CraveVerse',
    icon: HelpCircle,
    href: '/help',
    variant: 'ghost' as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="w-full justify-start h-auto p-4"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-start space-x-3">
                  <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
