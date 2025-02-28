import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from 'react-redux'
import { fetchAgentById, updateAgent } from '@/store/agentSlice'
import { RootState } from '@/store/store'
import { useEffect } from 'react'
import { AppDispatch } from '@/store/store'
import { useRouter } from 'next/navigation'

interface AgentBasicsProps {
  formData: {
    id: number
    initialMessage: string
    mainPrompt: string
  }
  updateFormData: (data: Partial<AgentBasicsProps["formData"]>) => void
}

export function AgentBasics({ formData, updateFormData }: AgentBasicsProps) {
  const dispatch = useDispatch<AppDispatch>()
  const selectedAgent = useSelector((state: RootState) => state.agent.selectedAgent)

  useEffect(() => {
    if (formData.id) {
      dispatch(fetchAgentById(formData.id))
    }
  }, [dispatch, formData.id])

  const handleSaveChanges = () => {
    if (selectedAgent) {
      dispatch(updateAgent(
        {
          ...selectedAgent,
          initial_message: formData.initialMessage,
          prompt: formData.mainPrompt,
        }
      ))
    }
  }



  return (
    <div className="space-y-6">
      {/* <div className="flex justify-end">
        <button onClick={handleGoBack} className="text-red-500">
          ✖
        </button>
      </div> */}
      <div className="space-y-2">
        <Label>Initial Message</Label>
        <Textarea
          placeholder="Enter initial message..."
          className="min-h-[100px]"
          value={formData.initialMessage}
          onChange={(e) => updateFormData({ initialMessage: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Main Prompt</Label>
        <Textarea
          placeholder="Enter a prompt for your company"
          className="min-h-[100px]"
          value={formData.mainPrompt}
          onChange={(e) => updateFormData({ mainPrompt: e.target.value })}
        />
      </div>

      <Button className="w-full bg-black hover:bg-black/90" onClick={handleSaveChanges}>
        Save Changes
      </Button>
    </div>
  )
}

