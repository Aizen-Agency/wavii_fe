"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentBasics } from "@/components/agent-form/agent-basics"
import { VoicePersonality } from "@/components/agent-form/voice-personality"
import { KnowledgeBase } from "@/components/agent-form/knowledge-base"
import { ConversationFlow } from "@/components/agent-form/conversation-flow"
import { Integration } from "@/components/agent-form/integration"
import { useParams, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchAgents } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, name: "Agent Basics" },
  { id: 2, name: "Personality" },
  { id: 3, name: "Knowledge Base" },
  { id: 4, name: "Conversation Flow" },
  { id: 5, name: "Integration & Settings" },
]

export default function EditAgentPage() {
  const { id: agentId } = useParams();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const selectedAgent = useSelector((state: RootState) => state.agent.selectedAgent);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    id: 0,
    initialMessage: "",
    mainPrompt: "",
    voiceType: "Alloy",
    personality: "",
    mainGoal: "Schedule meetings with potential clients",
    accent: "American",
    workingHours: "",
    cal_key: "",
    cal_event_id: "",
  })

  useEffect(() => {
    const step = searchParams.get('step');
    if (step) {
      setCurrentStep(parseInt(step));
    }
  }, [searchParams]);

  const handleGoBack = () => {
    router.push(`/agent/${formData.id}`)
  }
  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    if (selectedAgent && selectedAgent.id === parseInt(agentId as string)) {
      setFormData({
        id: selectedAgent.id,
        initialMessage: selectedAgent.initial_message,
        mainPrompt: selectedAgent.prompt,
        voiceType: selectedAgent.voice,
        personality: selectedAgent.personality,
        mainGoal: selectedAgent.main_goal,
        accent: selectedAgent.accent,
        workingHours: "", // Assuming workingHours is not part of the agent data
        cal_key: selectedAgent.cal_key,
        cal_event_id: selectedAgent.cal_event_id.toString(),
      });
    }
  }, [selectedAgent, agentId]);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  }

  const renderStep = () => {
    console.log(currentStep);
    switch (currentStep) {
      case 1:
        return <AgentBasics formData={formData} updateFormData={updateFormData} />
      case 2:
        return <VoicePersonality formData={formData} updateFormData={updateFormData} />
      case 3:
        return <KnowledgeBase formData={formData} updateFormData={updateFormData} />
      case 4:
        return <ConversationFlow />
      case 5:
        return <Integration formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-600">Edit Agent {agentId}</h2>
            <button className="text-gray-400 hover:text-gray-600" onClick={handleGoBack}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleStepClick(step.id)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                    ${currentStep >= step.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"}
                    hover:bg-purple-500 hover:text-white`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <span className={`text-sm mt-2 ${currentStep >= step.id ? "text-purple-600" : "text-gray-600"}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          <div className="relative">
            <Progress value={((currentStep - 1) / steps.length) * 100} className="h-1 absolute -top-6 left-0 right-0" />
            {renderStep()}
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              Previous
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={currentStep === steps.length ? () => router.push(`/agent/${agentId}`) : handleNext}
            >
              {currentStep === steps.length ? "Finish" : "Next"}
            </Button>
           
          </div>
        </div>
      </div>
    </div>
  )
}

