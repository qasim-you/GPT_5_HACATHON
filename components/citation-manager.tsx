"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Quote, Search, Download, Copy, Star, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface Citation {
  id: string
  text: string
  page: number
  confidence: number
  documentName: string
  documentId: string
  category?: string
  isFavorite?: boolean
  dateAdded: string
}

interface CitationManagerProps {
  citations: Citation[]
  onExport?: (format: string) => void
}

export function CitationManager({ citations, onExport }: CitationManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("apa")
  const [filterCategory, setFilterCategory] = useState("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (citationId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(citationId)) {
      newFavorites.delete(citationId)
    } else {
      newFavorites.add(citationId)
    }
    setFavorites(newFavorites)
  }

  const filteredCitations = citations.filter((citation) => {
    const matchesSearch =
      citation.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citation.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterCategory === "all" ||
      (filterCategory === "favorites" && favorites.has(citation.id)) ||
      citation.category === filterCategory
    return matchesSearch && matchesFilter
  })

  const formatCitation = (citation: Citation, format: string) => {
    const author = "Author, A." // In real app, this would be extracted from document
    const year = new Date(citation.dateAdded).getFullYear()
    const title = citation.documentName.replace(/\.[^/.]+$/, "")

    switch (format) {
      case "apa":
        return `${author} (${year}). ${title}. p. ${citation.page}.`
      case "mla":
        return `${author} "${title}." ${year}, p. ${citation.page}.`
      case "chicago":
        return `${author}, "${title}," ${year}, ${citation.page}.`
      default:
        return citation.text
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportCitations = () => {
    const formattedCitations = filteredCitations
      .map((citation) => formatCitation(citation, selectedFormat))
      .join("\n\n")

    const blob = new Blob([formattedCitations], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `citations-${selectedFormat}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const categories = Array.from(new Set(citations.map((c) => c.category).filter(Boolean)))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Quote className="h-5 w-5" />
          <span>Citation Manager</span>
        </CardTitle>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search citations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Citations</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Citation List</TabsTrigger>
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredCitations.map((citation) => (
                  <div key={citation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed mb-2">"{citation.text}"</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{citation.documentName}</span>
                          <span>•</span>
                          <span>Page {citation.page}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(citation.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(citation.id)}
                          className={cn("h-8 w-8 p-0", favorites.has(citation.id) && "text-yellow-500")}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(citation.text)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCitations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No citations found matching your criteria</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="formatted" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA Style</SelectItem>
                  <SelectItem value="mla">MLA Style</SelectItem>
                  <SelectItem value="chicago">Chicago Style</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportCitations} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredCitations.map((citation) => (
                  <div key={citation.id} className="border rounded-lg p-4">
                    <p className="text-sm leading-relaxed mb-2">{formatCitation(citation, selectedFormat)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">From: {citation.text.substring(0, 50)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formatCitation(citation, selectedFormat))}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
