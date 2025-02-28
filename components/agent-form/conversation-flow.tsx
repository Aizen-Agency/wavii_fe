import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

export function ConversationFlow() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Conversation Flow Builder</h3>
        <p className="text-gray-500 mb-4">
          Describe how you want the conversation with your AI agent to flow. What should the main topics or steps be?
        </p>
        <Textarea
          placeholder="e.g., Greet the user, ask about their needs, provide product information, answer questions, guide to purchase..."
          className="min-h-[200px]"
        />
      </div>

      <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
        <Zap className="w-4 h-4" /> Generate Conversation Flow
      </Button>
    </div>
  )
}

