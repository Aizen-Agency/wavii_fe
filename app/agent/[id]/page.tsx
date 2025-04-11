"use client"

import { Pencil, Phone, BarChart2, Calendar, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { updateAgent, updateSelectedAgent, fetchAgentById, createAgent } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import { fetchVoices } from "@/store/voiceSlice"
import { useEffect, useState } from "react"
import { RetellWebClient } from "retell-client-js-sdk"
import Modal from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import LoadingOverlay from "@/components/loadingOverlay"
import { toast } from 'react-toastify'

const retellWebClient = new RetellWebClient();

interface Agent {
    id: number;
    user_id: number;
    name: string;
    agent_type: string;
    main_goal: string;
    language: string;
    voice: string;
    personality: string;
    website: string;
    prompt: string;
    initial_message: string;
    inbound_enabled: boolean;
    google_calendar_id: string;
    total_call_duration: number;
    total_calls: number;
    accent: string;
    cal_key: string;
    twilio_sid: string;
    twilio_auth: string;
    retell_agent_id: string;
    retell_llm_id: string;
    created_at: string;
    agent_kb_ids: string[];
    cal_event_id: number;
    outbound_phone: number;
  }

export default function CreateAgentPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id: agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const voices = useSelector((state: RootState) => state.voice.voices);
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const selectedAgent = useSelector((state: RootState) => state.agent.selectedAgent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [rerender, setRerender] = useState(false);

  // Add state variables for each field
  const [agentName, setAgentName] = useState(agent?.name || "");
  const [agentType, setAgentType] = useState(agent?.agent_type || "");
  const [mainGoal, setMainGoal] = useState(agent?.main_goal || "");
  const [language, setLanguage] = useState(agent?.language || "");
  const [voice, setVoice] = useState(agent?.voice || "");
  const [accent, setAccent] = useState(agent?.accent || "");

  useEffect(() => {
    dispatch(fetchVoices());
  }, [dispatch]);

  useEffect(() => {
    if (agentId !== "0") {
      dispatch(fetchAgentById(Number(agentId)));
    }
  }, [agentId, dispatch]);

  useEffect(() => {
    if (selectedAgent) {
      setAgent(selectedAgent);
      setAgentName(selectedAgent.name);
      setAgentType(selectedAgent.agent_type);
      setMainGoal(selectedAgent.main_goal);
      setLanguage(selectedAgent.language);
      setVoice(selectedAgent.voice);
      setAccent(selectedAgent.accent);
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (agentId === "0") {
      setAgent({ 
        id: 0, 
        name: "", 
        agent_type: "", 
        main_goal: "", 
        language: "", 
        voice: "", 
        personality: "", 
        website: "", 
        prompt: "", 
        initial_message: "", 
        inbound_enabled: false,
        google_calendar_id: "",
        total_call_duration: 0,
        total_calls: 0,
        accent: "",
        cal_key: "",
        twilio_sid: "",
        twilio_auth: "",
        retell_agent_id: "",
        retell_llm_id: "",
        created_at: "",
        agent_kb_ids: [],
        cal_event_id: 0,
        user_id: 0,
        outbound_phone: 0
      });
    }
  }, [agentId]);

  useEffect(() => {
    if (agentId === "0") {
      setIsModalOpen(true);
    }
  }, [agentId]);

  const handleNameSubmit = async () => {
    if (newAgentName.trim()) {
      await handleEdit('name', newAgentName);
      setIsModalOpen(false);
    }
  };

  const handleEdit = async (field: string, value: string) => {
    if (agent) {
      setLoading(true);
      try {
        const updatedAgent = { ...agent, [field]: value };
        // Update state variables based on field
        if (field === 'name') setAgentName(value);
        if (field === 'agent_type') setAgentType(value);
        if (field === 'main_goal') setMainGoal(value);
        if (field === 'language') setLanguage(value);
        if (field === 'voice') setVoice(value);
        if (field === 'accent') setAccent(value);

        if (agentId === "0") {
          updatedAgent.name = newAgentName;
          const createdAgent = await dispatch(createAgent(updatedAgent)).unwrap();
          router.push(`/agent/${createdAgent.id}`);
          toast.success("Agent created successfully!");
        } else {
          console.log(updatedAgent);
          dispatch(updateSelectedAgent(updatedAgent));
          const updatedAgentresp = await dispatch(updateAgent(updatedAgent as Agent)).unwrap();
          console.log(updatedAgentresp);
          if (!updatedAgentresp.hasOwnProperty('error')) {
            toast.success("Agent updated successfully!");
          } else {
            toast.error("Operation failed. Please try again.");
          }
        }
        setRerender(!rerender);
      } catch (error) {
        console.error(error);
        toast.error("Operation failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const languageOptions = [
    "en-US", "en-IN", "en-GB", "de-DE", "es-ES", "es-419", "hi-IN", "ja-JP",
    "pt-PT", "pt-BR", "fr-FR", "zh-CN", "ru-RU", "it-IT", "ko-KR", "nl-NL",
    "pl-PL", "tr-TR", "vi-VN", "multi"
  ];

  if (!agent && agentId !== "0") {
    return <LoadingOverlay />;
  }

  interface RegisterCallResponse {
    access_token: string;
    call_id?: string;
  }

    // Register call using selected agent
    async function registerCall(agentId: string): Promise<RegisterCallResponse> {
        try {
          const response = await fetch("http://localhost:8080/create-web-call", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ agent_id: agentId })
          });
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const data: RegisterCallResponse = await response.json();
          return data;
        } catch (err) {
          console.error(err);
          throw new Error("Register call failed");
        }
      }
  const toggleConversation = async () => {
    console.log(isCalling);
    if (!selectedAgent?.retell_agent_id) {
      console.error("Please select an agent first.");
      return;
    }
    if (isCalling) {
      // Implement the logic to stop the call
      console.log(retellWebClient.isAgentTalking);
      retellWebClient.stopCall();
      console.log(retellWebClient.isAgentTalking);
      console.log("Stopping call");
      setIsCalling(false);
      // Wait 3 seconds after the call ends to fetch call details

      if (callId) {
        setTimeout(() => {
          // Implement the logic to fetch call details
          console.log("Fetching call details");
        }, 3000);
      }

    } else {
      try {
        // Implement the logic to register a call
        const registerCallResponse = await registerCall(selectedAgent?.retell_agent_id);
        if (registerCallResponse.access_token) {
          // Save call_id if returned by API
          if (registerCallResponse.call_id) {
            setCallId(registerCallResponse.call_id);
          }
          retellWebClient
            .startCall({ accessToken: registerCallResponse.access_token })
            .catch(console.error);
        console.log("Starting call");
        setIsCalling(true);
      }
     } catch (err) {
        console.error(err);
      }
    }
  }
  

  // useEffect(() => {
  //   // This effect will run whenever rerender state changes
  // }, [rerender]);

  return (
    <div className="min-h-screen bg-white p-6">
      {loading && <LoadingOverlay />}
      {/* Modal for entering new agent name */}
      {isModalOpen && (
          <Modal onClose={() => {
              router.push(`/agents`);
          }}>
          <div className="flex justify-end">
            <button
              className="text-gray-500 hover:text-gray-700 p-2"
              onClick={() => router.push(`/agents`)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4">Enter Agent Name</h2>
          
          <Input
            value={newAgentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAgentName(e.target.value)}
            placeholder="Enter agent name"
          />
          
          <Button className="mt-4 mr-4" onClick={handleNameSubmit}> Submit </Button>
            
        </Modal>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.push('/agents')}>
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <h1 className="text-4xl font-bold text-purple-600">{agentName}</h1>
          <button className="text-gray-400 hover:text-gray-600" onClick={() => handleEdit('name', prompt('Edit Name', agentName) || agentName)}>
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Content */}
          <Card className="p-8 flex flex-col items-center justify-center min-h-[500px]">
            {/* Microphone Button */}
            <div className="relative mb-8">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1" onClick={toggleConversation}>
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
              <Button variant="outline" className="gap-2" onClick={() => router.push(`/agent/${agentId}/analytics`)}>
                <BarChart2 className="w-4 h-4" /> View Analytics
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => router.push(`/agent/${agentId}/calendar`)}>
                <Calendar className="w-4 h-4" /> Calendar
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => router.push(`/agent/${agentId}/call-logs`)}>
                <PhoneCall className="w-4 h-4" /> Call Logs
              </Button>
              <Button className="gap-2 bg-black hover:bg-black/90" onClick={() => router.push(`/agent/${agentId}/phone`)}>
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
                    value={agentType}
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
                  <div className="font-medium">{mainGoal}</div>
                  <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => handleEdit('main_goal', prompt('Edit Main Goal', mainGoal) || mainGoal)}>
                    Edit
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Language</div>
                <div className="flex items-center justify-between">
                  <select
                    value={language}
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
                    value={voice}
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
                  <div className="font-medium">{accent}</div>
                  <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => handleEdit('accent', prompt('Edit Accent', accent) || accent)}>
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

