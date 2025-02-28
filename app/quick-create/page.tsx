"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createAgent } from "@/store/agentSlice"
import type { AppDispatch } from "@/store/store"
import LoadingOverlay from "@/components/loadingOverlay"
import ErrorPopup from "@/components/errorPopop"

export default function QuickCreatePage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState({
    name: "",
    companyPrompt: "",
    companyWebsite: "",
  })
  const [showError, setShowError] = useState<string | null>(null)
  const status = useSelector((state: any) => state.agent.status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const agentData = {
      name: formData.name,
      prompt: formData.companyPrompt,
      website: formData.companyWebsite,
      agent_type: null,
      main_goal: null,
      language: null,
      voice: null,
      personality: null,
      initial_message: null,
      inbound_enabled: false,
      google_calendar_id: null,
      total_call_duration: 0,
      total_calls: 0,
      accent: null,
    }

    const resultAction = await dispatch(createAgent(agentData))

    if (createAgent.fulfilled.match(resultAction)) {
      router.push("/agents")
    } else if (createAgent.rejected.match(resultAction)) {
      setShowError(resultAction.error.message || "An error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {status === "loading" && <LoadingOverlay />}
      {showError && <ErrorPopup message={showError} onClose={() => setShowError(null)} />}
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">Quick Start</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Describe your company</h1>
            <p className="text-gray-500">Write your company description, or your website, or both</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Name</div>
              <Input
                type="text"
                placeholder="Enter your name"
                className="shadow-[0_2px_8px_rgb(0,0,0,0.08)] border-gray-200"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Company Prompt</div>
              <Textarea
                placeholder="Enter a prompt for your company"
                className="min-h-[100px] shadow-[0_2px_8px_rgb(0,0,0,0.08)] border-gray-200"
                value={formData.companyPrompt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyPrompt: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Company Website</div>
              <Input
                type="url"
                placeholder="https://www.example.com"
                className="shadow-[0_2px_8px_rgb(0,0,0,0.08)] border-gray-200"
                value={formData.companyWebsite}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyWebsite: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-black hover:bg-black/90 rounded-lg h-11">
            Submit
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push("/agents")}
              className="text-blue-600 hover:underline text-sm"
            >
              Start from scratch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

