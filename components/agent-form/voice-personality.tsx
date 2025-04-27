import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgentById, updateAgent } from '@/store/agentSlice';
import { fetchVoices } from '@/store/voiceSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

interface VoicePersonalityProps {
  formData: {
    id: number;
    voiceType: string;
    personality: string;
    accent: string;
  }
  updateFormData: (data: Partial<VoicePersonalityProps["formData"]>) => void
}

export function VoicePersonality({ formData }: VoicePersonalityProps) {
  const dispatch = useDispatch<AppDispatch>();
  const voices = useSelector((state: RootState) => state.voice.voices);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    dispatch(fetchVoices());
  }, [dispatch]);

  const updateAgentVoice = async (agentId: number, newVoice: string) => {
    const fetchResult = await dispatch(fetchAgentById(agentId));

    if (fetchResult.type === 'agent/fetchAgentById/fulfilled') {
      const agent = fetchResult.payload;
      const updatedAgent = { 
        ...agent, 
        voice: newVoice
      };
      
      const updateResult = await dispatch(updateAgent(updatedAgent));
      if (updateResult.type === 'agent/updateAgent/fulfilled') {
        console.log('Agent voice updated successfully');
      } else {
        console.error('Failed to update agent voice:', updateResult.payload);
      }
    }
  };

  const playVoiceSample = (voiceId: string) => {
    const voice = voices.find(v => v.voice_id === voiceId);
    if (voice?.preview_audio_url) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      const audio = new Audio(voice.preview_audio_url);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setAudioElement(null);
      };
    }
  };

  const stopVoiceSample = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

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
      <div className="space-y-2">
        <Label>Voice Type</Label>
        <div className="flex gap-2">
          <Select 
            value={formData.voiceType} 
            onValueChange={(value: string) => updateAgentVoice(formData.id, value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select voice type" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voice_id} value={voice.voice_id}>
                  {voice.voice_name} ({voice.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.voiceType && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => isPlaying ? stopVoiceSample() : playVoiceSample(formData.voiceType)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Personality</Label>
        <Select 
          value={formData.personality} 
          onValueChange={(value: string) => updateAgentPersonality(formData.id, value)}
        >
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
        <Label>Accent</Label>
        <Select 
          value={formData.accent} 
          onValueChange={(value: string) => updateAgentVoice(formData.id, value)}
        >
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
    </div>
  );
}

