"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  BarChart3, 
  MessageSquare, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'

interface ResultsViewerProps {
  fileId: string
}

// Mock data - TODO: Replace with actual data from Supabase
const mockResults = {
  original: `# Conversation Analysis

## Key Points Discussed
- Project timeline and deliverables
- Resource allocation concerns
- Team communication improvements
- Budget considerations

## Action Items
1. Finalize project scope by Friday
2. Schedule weekly check-ins
3. Review budget with finance team
4. Update stakeholders on progress

## Next Steps
- Send follow-up email with action items
- Schedule next meeting for next week
- Prepare budget presentation`,

  analysis: `# AI Analysis Results

## Communication Patterns
- **Tone**: Professional and collaborative (85% confidence)
- **Clarity**: High clarity in expressing ideas (92% confidence)
- **Engagement**: Active participation throughout discussion (78% confidence)

## Relationship Dynamics
- **Trust Level**: High (88% confidence)
- **Collaboration**: Strong working relationship (91% confidence)
- **Communication Style**: Direct and solution-oriented (87% confidence)

## Recommendations
1. **Strengthen Follow-up**: Schedule regular check-ins to maintain momentum
2. **Clarify Expectations**: Ensure all action items have clear deadlines
3. **Build on Success**: Leverage the strong collaborative tone for future projects

## Risk Factors
- **Low Risk**: No significant communication barriers detected
- **Medium Risk**: Timeline pressure may affect quality
- **Mitigation**: Regular progress reviews and open communication`,

  insights: [
    {
      title: 'Communication Effectiveness',
      score: 87,
      description: 'Your communication style is clear and professional',
      trend: 'up',
    },
    {
      title: 'Collaboration Quality',
      score: 91,
      description: 'Strong working relationship with clear expectations',
      trend: 'up',
    },
    {
      title: 'Action Clarity',
      score: 78,
      description: 'Well-defined next steps with clear ownership',
      trend: 'stable',
    },
  ],

  metadata: {
    fileName: 'conversation_analysis.txt',
    fileSize: '2.4 KB',
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T11:45:00Z',
    status: 'completed',
    confidence: 89,
  }
}

export function ResultsViewer({ fileId }: ResultsViewerProps) {
  const [activeTab, setActiveTab] = useState('comparison')
  const results = mockResults

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* File Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">{results.metadata.fileName}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{results.metadata.fileSize}</span>
                  <span>•</span>
                  <span>Uploaded {formatDate(results.metadata.uploadedAt)}</span>
                  <span>•</span>
                  <Badge variant="default" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completed</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Confidence Score</div>
              <div className="text-2xl font-bold text-primary">{results.metadata.confidence}%</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Original Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {results.original}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>AI Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {results.analysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">
                  {results.analysis}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{insight.score}%</span>
                      <div className="flex items-center space-x-1">
                        {insight.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {insight.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                        {insight.trend === 'stable' && <div className="h-4 w-4 rounded-full bg-gray-400" />}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${insight.score}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
