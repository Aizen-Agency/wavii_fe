"use client"

import { Pencil, Phone, BarChart2, Calendar, PhoneCall, Headphones, Database, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { updateAgent, updateSelectedAgent, fetchAgentById, createAgent } from "@/store/agentSlice"
import type { Agent } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import { useEffect, useState } from "react"
import { RetellWebClient } from "retell-client-js-sdk"
import Modal from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import LoadingOverlay from "@/components/loadingOverlay"
import { toast } from 'react-toastify'
import axiosInstance from "@/utils/axios"
import PermissionWrapper from "@/components/PermissionWrapper"
import { fetchDashboardMetrics } from "@/store/metricSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const retellWebClient = new RetellWebClient();

export default function CreateAgentPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id: agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const selectedAgent = useSelector((state: RootState) => state.agent.selectedAgent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const metrics = useSelector((state: RootState) => state.metrics.metrics);


  const [isSingleCallModalOpen, setIsSingleCallModalOpen] = useState(false);
  const [isBulkCallModalOpen, setIsBulkCallModalOpen] = useState(false);
  const [toNumber, setToNumber] = useState("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dynamicVariables, setDynamicVariables] = useState<{ key: string; value: string }[]>([]);



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
        outbound_phone: undefined
      });
    }
  }, [agentId]);

  useEffect(() => {
    if (agentId === "0") {
      setIsModalOpen(true);
    }
  }, [agentId]);

  useEffect(() => {
    console.log('Agent ID:', agentId);
    if (agentId !== "0") {
      console.log('Fetching agent and metrics...');
      dispatch(fetchAgentById(Number(agentId)));
      dispatch(fetchDashboardMetrics(agentId as string));
    }
  }, [agentId, dispatch]);

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
      const response = await axiosInstance.post('/create-web-call', {
        agent_id: agentId
      });
      return response.data;
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

  const handleEditPrompt = () => {
    router.push(`/agent/${agentId}/edit?step=4`);
  };

  const handleSingleCall = () => {
    setIsSingleCallModalOpen(true);
  };

  const handleBulkCall = () => {
    setIsBulkCallModalOpen(true);
  };

  const handleModalClose = () => {
    setIsSingleCallModalOpen(false);
    setIsBulkCallModalOpen(false);
    setToNumber("");
    setSelectedPhoneNumber("");
    setSelectedFile(null);
    setDynamicVariables([]);
  };

  const addDynamicVariable = () => {
    setDynamicVariables([...dynamicVariables, { key: "", value: "" }]);
  };

  const removeDynamicVariable = (index: number) => {
    setDynamicVariables(dynamicVariables.filter((_, i) => i !== index));
  };

  const updateDynamicVariable = (index: number, field: 'key' | 'value', value: string) => {
    const updatedVariables = [...dynamicVariables];
    updatedVariables[index][field] = value;
    setDynamicVariables(updatedVariables);
  };

  const startCall = async (from_number: string, to_number: string) => {
    handleModalClose();
    try {
      const variables = dynamicVariables.reduce((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      await axiosInstance.post('/create-phone-call', {
        to_number: to_number,
        agent_id: agent?.retell_agent_id,
        from_number: from_number,
        variables: variables
      });
      
      toast.success('Call initiated successfully!');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startBatchCall = async (from_number: string, file: File) => {
    handleModalClose();
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('agent_id', agent?.retell_agent_id || '');
      formData.append('from_number', from_number);

      await axiosInstance.post('/create-batch-call', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Batch call initiated successfully!');
    } catch (error) {
      console.error('Error starting batch call:', error);
      toast.error('Failed to start batch call');
    }
  };

  const handleCallLogs = () => {
    router.push(`/agent/${agentId}/call-logs`);
  };

  const handleEditVoice = () => {
    router.push(`/agent/${agentId}/edit?step=2`);
  };

  const handleEditKnowledgeBase = () => {
    router.push(`/agent/${agentId}/edit?step=3&section=knowledge-base`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {loading && <LoadingOverlay />}
      {/* Modal for entering new agent name */}
      {isModalOpen && (
        <Modal onClose={() => { router.push(`/agents`) }}>
          <div className="flex justify-end">
            <PermissionWrapper componentName="EditAgent">
              <button
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={() => router.push(`/agents`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </PermissionWrapper>
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/agents')} className="mr-2">Back</Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{agent?.name}</h1>
            <div className="text-gray-400 text-lg font-medium">{agent?.User?.company_name}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm font-medium">Total calls</div>
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">{metrics.total_calls.value}</div>
            <div className="text-xs text-green-600 font-medium">+{metrics.total_calls.change}% from last month</div>
          </Card>
          <Card className="p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm font-medium">Meetings Booked</div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">{metrics.meetings_booked.value}</div>
            <div className="text-xs text-green-600 font-medium">+{metrics.meetings_booked.change}% from last month</div>
          </Card>
          <Card className="p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm font-medium">Unresponsive calls</div>
              <PhoneCall className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold">{metrics.unresponsive_calls.value}</div>
            <div className="text-xs text-red-500 font-medium">{metrics.unresponsive_calls.change}% from last month</div>
          </Card>
          <Card className="p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm font-medium">Avg cost per minute</div>
              <BarChart2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold">${metrics.avg_cost_per_minute.value}</div>
            <div className="text-xs text-red-500 font-medium">{metrics.avg_cost_per_minute.change}% from last month</div>
          </Card>
        </div>

        {/* Main Content: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Quick test the agent */}
          <Card className="flex flex-col items-center justify-center p-10 min-h-[400px]">
            <div className="mb-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 flex items-center justify-center cursor-pointer" onClick={toggleConversation}>
                <button className="w-full h-full rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Test Your Agent</h2>
            <p className="text-gray-500 mb-4 text-center">Click the microphone to start a conversation with your AI agent.</p>
          </Card>

          {/* Right: Outbound actions */}
          <Card className="p-8 flex flex-col gap-4 min-h-[400px]">
            <h2 className="text-2xl font-bold mb-4">Outbound</h2>
            <PermissionWrapper componentName="EditAgent">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleEditPrompt}
              >
                <Pencil className="w-4 h-4" /> Edit Prompt
              </Button>
            </PermissionWrapper>
            <PermissionWrapper componentName="BatchCall">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleSingleCall}
              >
                <Phone className="w-4 h-4" /> Single Calling
              </Button>
            </PermissionWrapper>
            <PermissionWrapper componentName="BatchCall">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleBulkCall}
              >
                <BarChart2 className="w-4 h-4" /> Bulk Calling
              </Button>
            </PermissionWrapper>
            <PermissionWrapper componentName="CallLogs">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleCallLogs}
              >
                <PhoneCall className="w-4 h-4" /> Call Logs
              </Button>
            </PermissionWrapper>
            <PermissionWrapper componentName="EditVoice">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleEditVoice}
              >
                <Headphones className="w-4 h-4" /> Edit voice
              </Button>
            </PermissionWrapper>
            <PermissionWrapper componentName="EditKnowledgeBase">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleEditKnowledgeBase}
              >
                <Database className="w-4 h-4" /> Edit Knowledge Base
              </Button>
            </PermissionWrapper>
          </Card>
        </div>
      </div>

      {/* Single Call Modal */}
      <Dialog open={isSingleCallModalOpen} onOpenChange={setIsSingleCallModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Outbound Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number to Call</Label>
              <Input
                id="phone"
                placeholder="Enter phone number (e.g., +1234567890)"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Dynamic Variables</Label>
              {dynamicVariables.map((variable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={variable.key}
                    onChange={(e) => updateDynamicVariable(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={variable.value}
                    onChange={(e) => updateDynamicVariable(index, 'value', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeDynamicVariable(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addDynamicVariable}>
                Add Variable
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => startCall(selectedPhoneNumber, toNumber)}
                disabled={!toNumber || !selectedPhoneNumber}
              >
                Start Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Call Modal */}
      <Dialog open={isBulkCallModalOpen} onOpenChange={setIsBulkCallModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Bulk Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Upload CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500">
                CSV should contain phone numbers in the first column
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedFile && startBatchCall(selectedPhoneNumber, selectedFile)}
                disabled={!selectedFile || !selectedPhoneNumber}
              >
                Start Batch Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

