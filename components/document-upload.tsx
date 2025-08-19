"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
}

interface DocumentUploadProps {
  onDocumentSelect?: (documentName: string) => void
}

export function DocumentUpload({ onDocumentSelect }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
  }, [])

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload and processing
    newFiles.forEach((file) => {
      simulateUpload(file.id)
    })
  }

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20

      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                progress: Math.min(progress, 100),
                status: progress >= 100 ? "processing" : "uploading",
              }
            : file,
        ),
      )

      if (progress >= 100) {
        clearInterval(interval)
        // Simulate processing time
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((file) => (file.id === fileId ? { ...file, status: "completed", progress: 100 } : file)),
          )
        }, 2000)
      }
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
    const removedFile = files.find((f) => f.id === fileId)
    if (removedFile && selectedFile === removedFile.name) {
      setSelectedFile(null)
      onDocumentSelect?.(null)
    }
  }

  const selectFile = (fileName: string) => {
    setSelectedFile(fileName)
    onDocumentSelect?.(fileName)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Upload Documents</CardTitle>
          <CardDescription>Upload PDFs, Word documents, or text files to get started with AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-mono font-semibold mb-2">Drop files here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX, TXT files up to 10MB each</p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center space-x-4 p-4 border rounded-lg transition-colors cursor-pointer",
                    selectedFile === file.name ? "border-purple-500 bg-purple-50" : "hover:bg-muted/50",
                  )}
                  onClick={() => file.status === "completed" && selectFile(file.name)}
                >
                  <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{formatFileSize(file.size)}</p>
                    {file.status === "completed" ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Ready for analysis</span>
                        </div>
                        {selectedFile === file.name && (
                          <span className="text-xs text-purple-600 font-medium">Selected</span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {file.status === "uploading" ? "Uploading..." : "Processing..."}
                          </span>
                          <span className="text-muted-foreground">{Math.round(file.progress)}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
