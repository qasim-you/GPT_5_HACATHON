"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Brain, Quote } from "lucide-react"

interface QAResponse {
  question: string
  answer: string
  confidence: number
  sources: Array<{
    page: number
    text: string
  }>
  timestamp: string
}

interface QAInterfaceProps {
  documentId?: string
  documentName?: string
}

export function QAInterface({ documentId, documentName }: QAInterfaceProps) {
  const [question, setQuestion] = useState("")
  const [responses, setResponses] = useState<QAResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !documentId) return

    setIsLoading(true)
    const currentQuestion = question
    setQuestion("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          documentId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newResponse: QAResponse = {
          question: currentQuestion,
          answer: data.answer,
          confidence: data.confidence,
          sources: data.sources,
          timestamp: new Date().toISOString(),
        }
        setResponses((prev) => [...prev, newResponse])
      }
    } catch (error) {
      console.error("Q&A error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Ask Questions</span>
        </CardTitle>
        {documentName && <p className="text-sm text-muted-foreground">About: {documentName}</p>}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {responses.map((response, index) => (
              <div key={index} className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium text-sm">{response.question}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(response.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{response.answer}</p>
                  {response.sources.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground flex items-center">
                        <Quote className="h-3 w-3 mr-1" />
                        Sources:
                      </p>
                      {response.sources.map((source, sourceIndex) => (
                        <div
                          key={sourceIndex}
                          className="text-xs text-muted-foreground pl-4 border-l-2 border-purple-200"
                        >
                          Page {source.page}: {source.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Brain className="h-4 w-4 animate-pulse" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={documentId ? "Ask a question about this document..." : "Upload a document first"}
            disabled={!documentId || isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!question.trim() || !documentId || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
