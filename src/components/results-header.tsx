"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2, CheckCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ResultsHeaderProps {
  fileId: string
}

export function ResultsHeader({ fileId }: ResultsHeaderProps) {
  const router = useRouter()

  const handleApprove = () => {
    // TODO: Implement approval logic
    console.log('Approving file:', fileId)
    // TODO: Call PostHog analytics
    // analytics.track('file_approved', { file_id: fileId })
  }

  const handleRequestRevision = () => {
    // TODO: Implement revision request logic
    console.log('Requesting revision for file:', fileId)
    // TODO: Call PostHog analytics
    // analytics.track('revision_requested', { file_id: fileId })
  }

  const handleDownload = () => {
    // TODO: Implement download logic
    console.log('Downloading file:', fileId)
    // TODO: Call PostHog analytics
    // analytics.track('file_downloaded', { file_id: fileId })
  }

  const handleShare = async () => {
    // TODO: Implement share logic with native share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CraveVerse Analysis Results',
          text: 'Check out my relationship insights from CraveVerse',
          url: window.location.href,
        })
        // TODO: Call PostHog analytics
        // analytics.track('file_shared', { file_id: fileId })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestRevision}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <X className="h-4 w-4 mr-2" />
              Request Revision
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Original
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Results
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
