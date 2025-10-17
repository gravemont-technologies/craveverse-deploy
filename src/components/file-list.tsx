"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  File, 
  Download, 
  Eye, 
  Trash2, 
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Mock data - TODO: Replace with actual data from Supabase
const mockFiles = [
  {
    id: '1',
    name: 'conversation_analysis.txt',
    type: 'text/plain',
    size: '2.4 KB',
    status: 'completed',
    uploadedAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-15T11:45:00Z',
  },
  {
    id: '2',
    name: 'relationship_insights.pdf',
    type: 'application/pdf',
    size: '1.2 MB',
    status: 'processing',
    uploadedAt: '2024-01-15T09:15:00Z',
    lastModified: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    name: 'communication_patterns.json',
    type: 'application/json',
    size: '856 bytes',
    status: 'pending',
    uploadedAt: '2024-01-14T16:20:00Z',
    lastModified: '2024-01-14T16:20:00Z',
  },
]

const statusConfig = {
  completed: { 
    label: 'Ready', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'text-green-600'
  },
  processing: { 
    label: 'In Review', 
    variant: 'secondary' as const, 
    icon: Clock,
    color: 'text-blue-600'
  },
  pending: { 
    label: 'Pending', 
    variant: 'outline' as const, 
    icon: AlertCircle,
    color: 'text-yellow-600'
  },
}

export function FileList() {
  const [files, setFiles] = useState(mockFiles)

  const handleDelete = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId))
    // TODO: Call PostHog analytics
    // analytics.track('file_deleted', { file_id: fileId })
  }

  const handleDownload = (fileId: string) => {
    // TODO: Implement actual download logic
    console.log('Downloading file:', fileId)
    // TODO: Call PostHog analytics
    // analytics.track('file_downloaded', { file_id: fileId })
  }

  const handleView = (fileId: string) => {
    // TODO: Navigate to results viewer
    console.log('Viewing file:', fileId)
    // TODO: Call PostHog analytics
    // analytics.track('file_viewed', { file_id: fileId })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Files</span>
          <Badge variant="outline">{files.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload your first file to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => {
              const status = statusConfig[file.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <File className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{file.size}</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant={status.variant} className="flex items-center space-x-1">
                      <StatusIcon className={`h-3 w-3 ${status.color}`} />
                      <span>{status.label}</span>
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(file.id)}
                        disabled={file.status !== 'completed'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file.id)}
                        disabled={file.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(file.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(file.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
