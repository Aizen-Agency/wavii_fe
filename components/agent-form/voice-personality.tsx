import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface VoicePersonalityProps {
  formData: {
    voiceType: string
    personality: string
    mainGoal: string
    accent: string
  }
  updateFormData: (data: Partial<VoicePersonalityProps["formData"]>) => void
}

export function VoicePersonality({ formData, updateFormData }: VoicePersonalityProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
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
      </div>

      <div className="space-y-2">
        <Label>Personality</Label>
        <Select value={formData.personality} onValueChange={(value: string) => updateFormData({ personality: value })}>
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
      </div>

      <div className="space-y-2">
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
      </div>

      <div className="flex gap-4">
        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Save Changes</Button>
        <Button variant="outline" className="flex-1">
          Play Sample
        </Button>
      </div>
    </div>
  )
}

