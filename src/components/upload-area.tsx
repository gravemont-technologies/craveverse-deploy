"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X } from 'lucide-react'
import { toast } from 'sonner'

export function UploadArea() {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    
    // TODO: Replace with actual file upload logic
    // This is a placeholder implementation
    for (const file of acceptedFiles) {
      try {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success(`${file.name} uploaded successfully`)
        
        // TODO: Call PostHog analytics
        // analytics.track('file_uploaded', { file_type: file.type, file_size: file.size })
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setIsUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    multiple: true,
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Drop files here' : 'Upload your files'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop files here, or click to select files
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <File className="h-3 w-3" />
              <span>Supports: TXT, PDF, JSON, CSV</span>
            </div>
            
            {!isUploading && (
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            )}
            
            {isUploading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
