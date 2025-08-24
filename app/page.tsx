"use client"

import { useState } from "react"
import { DocumentUpload } from "@/components/document-upload"
import { AnalysisPanel } from "@/components/analysis-panel"
import { QAInterface } from "@/components/qa-interface"
import { CitationManager } from "@/components/citation-manager"
import { DashboardOverview } from "@/components/dashboard-overview"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import PlagiarismChecker from "@/components/plagiarism-checker"

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

export default function HomePage() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null)
  const [allCitations, setAllCitations] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    documentsUploaded: 0,
    citationsGenerated: 0,
    questionsAsked: 0,
    insightsExtracted: 0,
    recentDocuments: [],
    topTopics: [],
  })

  const handleDocumentSelect = (documentName: string) => {
    setSelectedDocument(documentName)
    setCurrentAnalysis(null)

    const newActivity = {
      type: "upload",
      description: `Uploaded ${documentName}`,
      timestamp: new Date().toISOString(),
    }
    setRecentActivity((prev) => [newActivity, ...prev])
    setDashboardStats((prev) => ({
      ...prev,
      documentsUploaded: prev.documentsUploaded + 1,
      recentDocuments: [
        { name: documentName, uploadDate: new Date().toISOString(), status: "processing" },
        ...prev.recentDocuments.slice(0, 4),
      ],
    }))
  }

  const handleAnalysisComplete = (analysis: AnalysisResult) => {
    setCurrentAnalysis(analysis)

    const newActivity = {
      type: "analysis",
      description: `Analyzed ${analysis.documentName}`,
      timestamp: new Date().toISOString(),
    }
    setRecentActivity((prev) => [newActivity, ...prev])
    setDashboardStats((prev) => ({
      ...prev,
      insightsExtracted: prev.insightsExtracted + analysis.keyInsights.length,
      topTopics: [...new Set([...prev.topTopics, ...analysis.topics])].slice(0, 5),
      recentDocuments: prev.recentDocuments.map((doc) =>
        doc.name === analysis.documentName ? { ...doc, status: "completed" } : doc,
      ),
    }))
  }

  const handleCitationsUpdate = (citations: any[]) => {
    setAllCitations((prev) => [...prev, ...citations])
    setDashboardStats((prev) => ({
      ...prev,
      citationsGenerated: prev.citationsGenerated + citations.length,
    }))
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview stats={dashboardStats} />
      case "research":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <DocumentUpload onDocumentSelect={handleDocumentSelect} />
              {selectedDocument && <QAInterface documentId={currentAnalysis?.id} documentName={selectedDocument} />}
            </div>
            <div className="lg:sticky lg:top-6">
              <AnalysisPanel
                documentName={selectedDocument}
                onAnalysisComplete={handleAnalysisComplete}
                onCitationsUpdate={handleCitationsUpdate}
              />
            </div>
          </div>
        )
      case "citations":
        return <CitationManager citations={allCitations} />
      case "plagiarism":
        return <PlagiarismChecker />
      default:
        return <DashboardOverview stats={dashboardStats} />
    }
  }

  return (
    <>
      <AppSidebar onViewChange={handleViewChange} currentView={currentView} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">AI Research Assistant</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {currentView === "dashboard"
                      ? "Dashboard"
                      : currentView === "research"
                      ? "Research"
                      : currentView === "citations"
                      ? "Citations"
                      : currentView === "plagiarism"
                      ? "Plagiarism Checker"
                      : "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {currentView === "dashboard" && (
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold font-mono text-foreground">AI Research Assistant</h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your documents and get AI-powered insights, ask questions, check plagiarism, and receive verified
                citations for your research.
              </p>
            </div>
          )}
          {renderCurrentView()}
        </div>
      </SidebarInset>
    </>
  )
}
