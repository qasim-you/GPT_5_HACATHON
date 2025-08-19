"use client"

import type * as React from "react"
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  PieChart,
  SquareTerminal,
  FileText,
  MessageSquare,
  BarChart3,
  Search,
  Brain,
  Quote,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Research Assistant",
    email: "ai@research.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "AI Research Lab",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Personal Research",
      logo: Brain,
      plan: "Free",
    },
    {
      name: "Academic Projects",
      logo: BookOpen,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Analytics",
          url: "#",
        },
        {
          title: "Recent Activity",
          url: "#",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Upload Documents",
          url: "#",
        },
        {
          title: "Document Library",
          url: "#",
        },
        {
          title: "Processing Queue",
          url: "#",
        },
      ],
    },
    {
      title: "AI Analysis",
      url: "#",
      icon: Brain,
      items: [
        {
          title: "Insights",
          url: "#",
        },
        {
          title: "Key Findings",
          url: "#",
        },
        {
          title: "Summaries",
          url: "#",
        },
      ],
    },
    {
      title: "Q&A Interface",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Ask Questions",
          url: "#",
        },
        {
          title: "Chat History",
          url: "#",
        },
        {
          title: "Saved Conversations",
          url: "#",
        },
      ],
    },
    {
      title: "Citations",
      url: "#",
      icon: Quote,
      items: [
        {
          title: "Citation Manager",
          url: "#",
        },
        {
          title: "Export Citations",
          url: "#",
        },
        {
          title: "Citation Formats",
          url: "#",
        },
      ],
    },
    {
      title: "Research Tools",
      url: "#",
      icon: Search,
      items: [
        {
          title: "Advanced Search",
          url: "#",
        },
        {
          title: "Topic Modeling",
          url: "#",
        },
        {
          title: "Trend Analysis",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Machine Learning Research",
      url: "#",
      icon: Bot,
    },
    {
      name: "Climate Change Analysis",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Medical Literature Review",
      url: "#",
      icon: BookOpen,
    },
    {
      name: "Economic Policy Study",
      url: "#",
      icon: BarChart3,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
