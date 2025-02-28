"use client"

import { Pencil, Phone, BarChart2, Calendar, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { updateAgent, updateSelectedAgent, fetchAgentById } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import { fetchVoices } from "@/store/voiceSlice"
import { useEffect } from "react"

export default function CreateAgentPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const agents = useSelector((state: RootState) => state.agent.agents);
  console.log(agents);
  const { id: agentId } = useParams(); // Use useParams to get the agentId
  const agent = agents.find((agent) => agent.id === Number(agentId));
  const voices = useSelector((state: RootState) => state.voice.voices);

  useEffect(() => {
    dispatch(fetchVoices());
  }, [dispatch]);

  useEffect(() => {
    if (agentId) {
      dispatch(fetchAgentById(Number(agentId)));
    }
  }, [dispatch, agentId]);

  const handleEdit = (field: string, value: string) => {
    if (agent) {
      const updatedAgent = { ...agent, [field]: value };
      dispatch(updateSelectedAgent(updatedAgent));
      dispatch(updateAgent(updatedAgent));
    }
  };

  const languageOptions = [
    "en-US", "en-IN", "en-GB", "de-DE", "es-ES", "es-419", "hi-IN", "ja-JP",
    "pt-PT", "pt-BR", "fr-FR", "zh-CN", "ru-RU", "it-IT", "ko-KR", "nl-NL",
    "pl-PL", "tr-TR", "vi-VN", "multi"
  ];

  if (!agent) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.push('/agents')}>
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <h1 className="text-4xl font-bold text-purple-600">{agent.name}</h1>
          <button className="text-gray-400 hover:text-gray-600" onClick={() => handleEdit('name', prompt('Edit Name', agent.name) || agent.name)}>
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Content */}
          <Card className="p-8 flex flex-col items-center justify-center min-h-[500px]">
            {/* Microphone Button */}
            <div className="relative mb-8">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                <button className="w-full h-full rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor">
                    <path
                      d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Test Your Agent</h2>
            <p className="text-gray-500 mb-12">Click the microphone to start a conversation with your AI agent.</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="gap-2" onClick={() => router.push(`/agent/${agentId}/edit`)}>
                <Pencil className="w-4 h-4" /> Edit Agent
              </Button>
              <Button variant="outline" className="gap-2">
                <BarChart2 className="w-4 h-4" /> View Analytics
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" /> Calendar
              </Button>
              <Button variant="outline" className="gap-2">
                <PhoneCall className="w-4 h-4" /> Call Logs
              </Button>
              <Button className="gap-2 bg-black hover:bg-black/90">
                <Phone className="w-4 h-4" /> Phone
              </Button>
            </div>
          </Card>

          {/* Agent Details Sidebar */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Agent Details</h2>

            <div className="space-y-6">
              <div className="space-y-1">
                <div className="text-gray-500">Type</div>
                <div className="flex items-center justify-between">
                  <select
                    value={agent.agent_type}
                    onChange={(e) => handleEdit('agent_type', e.target.value)}
                    className="font-medium text-gray-700"
                  >
                    <option value="Outbound">Outbound</option>
                    <option value="Inbound">Inbound</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Main Goal</div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{agent.main_goal}</div>
                  <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => handleEdit('main_goal', prompt('Edit Main Goal', agent.main_goal) || agent.main_goal)}>
                    Edit
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Language</div>
                <div className="flex items-center justify-between">
                  <select
                    value={agent.language}
                    onChange={(e) => handleEdit('language', e.target.value)}
                    className="font-medium text-gray-700"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Voice</div>
                <div className="flex items-center justify-between">
                  <select
                    value={agent.voice}
                    onChange={(e) => handleEdit('voice', e.target.value)}
                    className="font-medium text-gray-700"
                  >
                    {voices.map((voice) => (
                      <option key={voice.voice_id} value={voice.voice_name}>
                        {voice.voice_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Accent</div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{agent.accent}</div>
                  <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => handleEdit('accent', prompt('Edit Accent', agent.accent) || agent.accent)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

