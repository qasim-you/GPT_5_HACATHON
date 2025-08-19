"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Quote, MessageCircle, TrendingUp, Clock, Star } from "lucide-react"

interface DashboardStats {
  documentsUploaded: number
  citationsGenerated: number
  questionsAsked: number
  insightsExtracted: number
  recentDocuments: Array<{
    name: string
    uploadDate: string
    status: string
  }>
  topTopics: string[]
}

interface DashboardOverviewProps {
  stats: DashboardStats
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const statCards = [
    {
      title: "Documents Analyzed",
      value: stats.documentsUploaded,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Citations Generated",
      value: stats.citationsGenerated,
      icon: Quote,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Questions Asked",
      value: stats.questionsAsked,
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Insights Extracted",
      value: stats.insightsExtracted,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono mb-2">Research Dashboard</h2>
        <p className="text-muted-foreground">Overview of your research activity and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentDocuments.length > 0 ? (
                stats.recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={doc.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {doc.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">Upload your first document to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Top Research Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTopics.length > 0 ? (
                stats.topTopics.map((topic, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{topic}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 20) + 5} mentions
                      </span>
                    </div>
                    <Progress value={Math.random() * 100} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No topics identified yet</p>
                  <p className="text-sm">Analyze documents to see trending topics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Research Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Document Analysis</span>
                <span className="text-sm text-muted-foreground">{stats.documentsUploaded > 0 ? "100%" : "0%"}</span>
              </div>
              <Progress value={stats.documentsUploaded > 0 ? 100 : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Citation Collection</span>
                <span className="text-sm text-muted-foreground">
                  {Math.min((stats.citationsGenerated / 10) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={Math.min((stats.citationsGenerated / 10) * 100, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Q&A Exploration</span>
                <span className="text-sm text-muted-foreground">
                  {Math.min((stats.questionsAsked / 5) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={Math.min((stats.questionsAsked / 5) * 100, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
