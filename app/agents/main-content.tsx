"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAgents, deleteAgent, setSelectedAgent } from "@/store/agentSlice"
import { useRouter } from "next/navigation"
import { LayoutGrid, Grid2X2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppDispatch, RootState } from "@/store/store"
import LoadingOverlay from "@/components/loadingOverlay"
import PermissionWrapper from "@/components/PermissionWrapper"


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
}

export function MainContent() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { agents, status, error } = useSelector((state: RootState) => state.agent)

  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  const handleDelete = (id: number) => {
    dispatch(deleteAgent(id))
  }

  return (
    <div className="flex-1 overflow-auto">
      {status === "loading" && <LoadingOverlay />}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Agents</h1>

          <div className="flex items-center gap-3">
            <PermissionWrapper componentName="CreateAgent">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-600"
              onClick={() => router.push("/quick-create")}
            >
              <span className="mr-2">+</span> Quick Create
            </Button>
            </PermissionWrapper>
            <PermissionWrapper componentName="CreateAgent">
            <Button className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push("/agent/0")}>
              <span className="mr-2">+</span> Create New Agent
            </Button>
            </PermissionWrapper>

            <div className="flex items-center border rounded-lg p-1 ml-4">
              <button className="p-1.5 rounded hover:bg-gray-50">
                <Grid2X2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-50">
                <LayoutGrid className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Render agent list in grid f ormat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {status === 'loading' && <p>Loading...</p>}
          {status === 'failed' && <p>Error: {error || JSON.stringify(error)}</p>}
          {status === 'succeeded' && agents.map((agent: Agent) => (
            <div
              key={agent.id}
              className="relative border p-4 rounded-lg shadow-sm cursor-pointer"
              onClick={() => {
                dispatch(setSelectedAgent(agent))
                router.push(`/agent/${agent.id}`)
              }}
            >
              <h2 className="text-lg font-semibold">{agent.name}</h2>
              <p className="text-gray-500">{agent.website}</p>
              <p className="text-gray-500">Type: {agent.agent_type}</p>
              <p className="text-gray-500">Goal: {agent.main_goal}</p>
              <p className="text-gray-500">
                Created At: {new Date(agent.created_at).toLocaleDateString("en-GB")}
              </p>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <PermissionWrapper componentName="Dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/agent/${agent.id}/dashboard`);
                  }}
                >
                  Dashboard
                </Button>
                </PermissionWrapper>
                 <PermissionWrapper componentName="DeleteAgent">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(agent.id);
                  }}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                </PermissionWrapper>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

