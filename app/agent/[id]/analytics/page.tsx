"use client"

import { ArrowLeft, Phone, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"


export default function AgentAnalytics() {
    const router = useRouter()
    const { id: agentId } = useParams();  

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/agent/${agentId}`} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-2xl font-bold">Agent Analytics</h1>
        </div>
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Calls Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <h2 className="text-3xl font-bold mt-1">0</h2>
            </div>
            <div className="p-2 rounded-full bg-gray-100">
              <Phone className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Average Call Duration Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Call Duration</p>
              <h2 className="text-3xl font-bold mt-1">0m 0s</h2>
            </div>
            <div className="p-2 rounded-full bg-gray-100">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Booking Rate Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Booking Rate</p>
              <h2 className="text-3xl font-bold mt-1">0.0%</h2>
              <p className="text-sm text-gray-500 mt-1">0 of 0 appointments</p>
            </div>
            <div className="p-2 rounded-full bg-gray-100">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Call Volume Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Daily Call Volume</h3>
        <div className="h-80 w-full flex items-center justify-center text-gray-400">
          {/* This would be where you'd implement your chart */}
          <p>No call data available</p>
        </div>
      </div>

      {/* Additional Analytics Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Total Talk Time */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Total Talk Time</h3>
          <div className="flex items-center justify-center h-64">
            <span className="text-4xl font-bold">0m 0s</span>
          </div>
        </div>

        {/* Busiest Hours */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Busiest Hours</h3>
          <div className="h-64 w-full flex items-center justify-center text-gray-400">
            {/* This would be where you'd implement your timeline/chart */}
            <p>No data available</p>
          </div>
        </div>
      </div>
    </div>
  )
}

