"use client"

import { Sidebar } from "@/components/sidebar"
import SubAccountsPage from "./subaccounts"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab="/subaccounts" />
      <SubAccountsPage />
    </div>
  )
}