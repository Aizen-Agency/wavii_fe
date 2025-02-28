import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useDispatch } from 'react-redux';
import { fetchAgentById, updateAgent } from '@/store/agentSlice';
import { AppDispatch } from '@/store/store';


interface VoicePersonalityProps {
  formData: {
    id: number
   
    personality: string
   
  }
  updateFormData: (data: Partial<VoicePersonalityProps["formData"]>) => void
}

export function VoicePersonality({ formData }: VoicePersonalityProps) {
  const dispatch = useDispatch<AppDispatch>();

  const updateAgentPersonality = async (agentId: number, newPersonality: string) => {
    // Fetch the agent by ID
    const fetchResult = await dispatch(fetchAgentById(agentId));

    if (fetchResult.type === 'agent/fetchAgentById/fulfilled') {
      const agent = fetchResult.payload;

      // Create a new object without modifying the original agent
      const { prompt: agentprompt, ...restOfAgent } = agent;

      // Update the agent's personality and prompt
      const personalityRegex = /You are a (Professional|Casual|Friendly) voice assistant\./;
      let updatedPrompt;

      if (personalityRegex.test(agentprompt)) {
        updatedPrompt = agentprompt.replace(personalityRegex, `You are a ${newPersonality} voice assistant.`);
      } else {
        updatedPrompt = `You are a ${newPersonality} voice assistant. ${agentprompt}`;
      }

      const updatedAgent = { 
        ...restOfAgent, 
        personality: newPersonality,
        prompt: updatedPrompt
      };
      console.log(updatedAgent);
      const updateResult = await dispatch(updateAgent(updatedAgent));

      if (updateResult.type === 'agent/updateAgent/fulfilled') {
        console.log('Agent personality and prompt updated successfully');
      } else {
        console.error('Failed to update agent personality and prompt:', updateResult.payload);
      }
    } else {
      console.error('Failed to fetch agent:', fetchResult.payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="space-y-2">
        <Label>Voice Type</Label>
        <Select value={formData.voiceType} onValueChange={(value: string) => updateFormData({ voiceType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select voice type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alloy">Alloy</SelectItem>
            <SelectItem value="Echo">Echo</SelectItem>
            <SelectItem value="Fable">Fable</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      <div className="space-y-2">
        <Label>Personality</Label>
        <Select value={formData.personality} onValueChange={(value: string) => updateAgentPersonality(formData.id, value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select personality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Professional">Professional</SelectItem>
            <SelectItem value="Friendly">Friendly</SelectItem>
            <SelectItem value="Casual">Casual</SelectItem>
          </SelectContent>
        </Select>
      </div>
{/* 
      <div className="space-y-2">
        <Label>Main Goal</Label>
        <Select value={formData.mainGoal} onValueChange={(value: string) => updateFormData({ mainGoal: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select main goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Schedule meetings with potential clients">
              Schedule meetings with potential clients
            </SelectItem>
            <SelectItem value="Answer product questions">Answer product questions</SelectItem>
            <SelectItem value="Provide customer support">Provide customer support</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* <div className="space-y-2">
        <Label>Accent</Label>
        <Select value={formData.accent} onValueChange={(value: string) => updateFormData({ accent: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select accent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="American">American</SelectItem>
            <SelectItem value="British">British</SelectItem>
            <SelectItem value="Australian">Australian</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* <div className="flex gap-4">
        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Save Changes</Button>
        <Button variant="outline" className="flex-1">
          Play Sample
        </Button>
      </div> */}
    </div>
  )
}

