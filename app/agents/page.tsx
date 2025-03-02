"use client"

import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/app/agents/main-content"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab="/agents" />
      <MainContent />
    </div>
  )
}

