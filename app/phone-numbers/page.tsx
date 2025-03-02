"use client"

import { Sidebar } from "@/components/sidebar"
import PhoneNumbersPage from "./phone-number-page"
export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <PhoneNumbersPage />
    </div>
  )
}