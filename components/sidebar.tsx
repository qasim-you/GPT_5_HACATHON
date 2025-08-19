"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Upload, FileText, MessageCircle, Quote, BarChart3, Home, Settings, HelpCircle, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SidebarProps {
  currentView?: string
  onViewChange?: (view: string) => void
  recentActivity?: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

function SidebarContent({
  currentView = "dashboard",
  onViewChange,
  recentActivity = [],
  onClose,
}: SidebarProps & { onClose?: () => void }) {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "research", label: "Research & Analysis", icon: FileText },
    { id: "citations", label: "Citation Manager", icon: Quote },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ]

  const quickActions = [
    { label: "Upload Document", icon: Upload, action: "upload" },
    { label: "Ask Question", icon: MessageCircle, action: "question" },
    { label: "View Insights", icon: BarChart3, action: "insights" },
  ]

  const handleNavClick = (viewId: string) => {
    onViewChange?.(viewId)
    onClose?.()
  }

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-sidebar-border">
        <h2 className="font-mono font-semibold text-sidebar-foreground">Menu</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-sidebar-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Navigation */}
        <div className="space-y-2">
          <h3 className="font-mono font-semibold text-sm text-sidebar-foreground">Navigation</h3>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  currentView === item.id && "bg-sidebar-primary text-sidebar-primary-foreground font-medium",
                )}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="font-mono font-semibold text-sm text-sidebar-foreground">Quick Actions</h3>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                onClick={() => handleNavClick(action.action)}
              >
                <action.icon className="h-4 w-4 mr-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="p-4 bg-card border-sidebar-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-semibold text-sm text-card-foreground">Recent Activity</h4>
              {recentActivity.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                  {recentActivity.length}
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-card-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground space-y-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">No documents uploaded yet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Quote className="h-3 w-3" />
                    <span className="text-xs">No citations generated</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <div className="p-4 space-y-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & Support
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ currentView = "dashboard", onViewChange, recentActivity = [] }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent
            currentView={currentView}
            onViewChange={onViewChange}
            recentActivity={recentActivity}
            onClose={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:block w-64 h-screen sticky top-0">
        <SidebarContent currentView={currentView} onViewChange={onViewChange} recentActivity={recentActivity} />
      </aside>
    </>
  )
}
