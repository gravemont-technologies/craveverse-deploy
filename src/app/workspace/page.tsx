import { WorkspaceHeader } from '@/components/workspace-header'
import { UploadArea } from '@/components/upload-area'
import { FileList } from '@/components/file-list'
import { WorkspaceStats } from '@/components/workspace-stats'

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-background">
      <WorkspaceHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <WorkspaceStats />
          <UploadArea />
          <FileList />
        </div>
      </main>
    </div>
  )
}
