"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ScheduleCalendar } from "@/components/agent-form/schedule-calendar"

export default function AgentCalendar() {
  const { id: agentId } = useParams()

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/agent/${agentId}`} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="text-2xl font-bold">Calendar Settings</h1>
      </div>

      <ScheduleCalendar agentId={agentId as string} />
    </div>
  )
} 