"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, FileText, Quote, TrendingUp, Download, AlertCircle } from "lucide-react"

interface AnalysisResult {
  id: string
  documentName: string
  summary: string
  keyInsights: string[]
  citations: Array<{
    text: string
    page: number
    confidence: number
  }>
  topics: string[]
  analysisDate: string
}

interface AnalysisPanelProps {
  documentName?: string
  onAnalysisComplete?: (analysis: AnalysisResult) => void
  onCitationsUpdate?: (citations: any[]) => void
}

export function AnalysisPanel({ documentName, onAnalysisComplete, onCitationsUpdate }: AnalysisPanelProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (documentName && !selectedAnalysis) {
      handleAnalyze(documentName)
    }
  }, [documentName])

  const handleAnalyze = async (docName: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentName: docName,
          fileType: docName.split(".").pop() || "pdf",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSelectedAnalysis(data.analysis)
        onAnalysisComplete?.(data.analysis)

        const formattedCitations = data.analysis.citations.map((citation: any, index: number) => ({
          id: `${data.analysis.id}-${index}`,
          text: citation.text,
          page: citation.page,
          confidence: citation.confidence,
          documentName: data.analysis.documentName,
          documentId: data.analysis.id,
          category: "analysis",
          dateAdded: data.analysis.analysisDate,
        }))
        onCitationsUpdate?.(formattedCitations)
      } else {
        setError(data.error || "Analysis failed")
      }
    } catch (err) {
      setError("Failed to connect to analysis service")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reAnalyze = () => {
    if (selectedAnalysis) {
      handleAnalyze(selectedAnalysis.documentName)
    }
  }

  if (isAnalyzing) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-purple-600 animate-pulse mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">Analyzing Document...</h3>
              <p className="text-muted-foreground">AI is extracting insights and generating citations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">Analysis Failed</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={reAnalyze} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedAnalysis) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">No Document Selected</h3>
              <p className="text-muted-foreground">Upload a document to begin AI analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold">AI Analysis Results</h2>
            <p className="text-sm text-muted-foreground">Analyzed {selectedAnalysis.documentName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={reAnalyze} size="sm" disabled={isAnalyzing}>
            Re-analyze
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedAnalysis.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Generated on {new Date(selectedAnalysis.analysisDate).toLocaleDateString()}
              </p>
              <p className="leading-relaxed">{selectedAnalysis.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Quote className="h-5 w-5" />
                <span>Verified Citations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {selectedAnalysis.citations.map((citation, index) => (
                    <div key={index} className="border-l-4 border-purple-200 pl-4 py-2">
                      <p className="text-sm leading-relaxed mb-2">"{citation.text}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Page {citation.page}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(citation.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identified Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedAnalysis.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
