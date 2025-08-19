import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, MessageSquare, BookOpen, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-accent" />
            <span className="font-mono font-bold text-xl">ResearchAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              Q&A
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              Insights
            </Button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
