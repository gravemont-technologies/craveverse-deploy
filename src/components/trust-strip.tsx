import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye } from 'lucide-react'

const trustItems = [
  { icon: Shield, text: 'SOC 2 Compliant' },
  { icon: Lock, text: 'End-to-End Encryption' },
  { icon: Eye, text: 'Privacy-First Design' },
]

export function TrustStrip() {
  return (
    <section className="py-12 bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="font-medium">Trusted by professionals worldwide</span>
          <div className="flex items-center gap-4">
            {trustItems.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <item.icon className="h-3 w-3" />
                {item.text}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
