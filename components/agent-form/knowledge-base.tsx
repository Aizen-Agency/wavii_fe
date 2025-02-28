import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" /> Upload Knowledge Base
        </Button>
        <Button className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700">Generate Embeddings</Button>
      </div>

      <div>
        <h3 className="font-medium mb-2">Uploaded Files</h3>
        <p className="text-gray-500">No files uploaded yet.</p>
      </div>
    </div>
  )
}

