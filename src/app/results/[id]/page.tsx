import { ResultsViewer } from '@/components/results-viewer'
import { ResultsHeader } from '@/components/results-header'

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default function ResultsPage({ params }: ResultsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <ResultsHeader fileId={params.id} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResultsViewer fileId={params.id} />
      </main>
    </div>
  )
}
