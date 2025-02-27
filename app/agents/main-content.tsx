"use client"

import { useRouter } from "next/navigation"
import { LayoutGrid, Grid2X2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainContent() {
  const router = useRouter()

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Agents</h1>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-600"
              onClick={() => router.push("/quick-create")}
            >
              <span className="mr-2">+</span> Quick Create
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <span className="mr-2">+</span> Create New Agent
            </Button>

            <div className="flex items-center border rounded-lg p-1 ml-4">
              <button className="p-1.5 rounded hover:bg-gray-50">
                <Grid2X2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-50">
                <LayoutGrid className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty state or agent list would go here */}
        <div className="h-96 flex items-center justify-center text-gray-400">No agents created yet</div>
      </div>
    </div>
  )
}

