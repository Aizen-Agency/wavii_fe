"use client";

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function QuickCreatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    agentName: "",
    companyPrompt: "",
    companyWebsite: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formData)
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">Quick Start</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Describe your company</h1>
            <p className="text-gray-500">Write your company description, or your website, or both</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                placeholder="Enter agent name"
                value={formData.agentName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    agentName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPrompt">Company Prompt</Label>
              <Textarea
                id="companyPrompt"
                placeholder="Enter a prompt for your company"
                className="min-h-[100px]"
                value={formData.companyPrompt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyPrompt: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="https://www.example.com"
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

          <Button type="submit" className="w-full bg-black hover:bg-black/90">
            Submit
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => router.push("/")} className="text-blue-600 hover:underline text-sm"> 
              Start from scratch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

