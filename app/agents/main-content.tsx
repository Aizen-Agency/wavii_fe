"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAgents, deleteAgent, setSelectedAgent } from "@/store/agentSlice"
import { fetchSubAccounts } from "@/store/authSlice"
import { useRouter } from "next/navigation"
import { Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppDispatch, RootState } from "@/store/store"
import LoadingOverlay from "@/components/loadingOverlay"
import PermissionWrapper from "@/components/PermissionWrapper"


interface Role {
  id: number;
  name: string;
  description: string;
}

interface SubAccount {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  Users: User[];
  success_rate: string;
  total_call_cost: string;
  total_agents: number;
  total_bookings: number;
  successful_bookings: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  prompt?: string | null;
  parent_username?: string | null;
  is_subaccount?: boolean | null;
  stripe_customer_id?: string | null;
  logo_url?: string | null;
  color_scheme?: string | null;
  login_heading?: string | null;
  login_subheading?: string | null;
  available_credits: number;
  company_name: string;
  retell_key: string;
  roles?: Role[];
  Agents?: Agent[];
}

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
  outbound_phone?: number;
  success_rate?: string;
  User?: User;
}


export function MainContent() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { agents, status } = useSelector((state: RootState) => state.agent)
  const [localUser, setLocalUser] = useState<User | null>(null)

  // Helper to get the first role name (adjust if you want to support multiple roles)
  // const userRoleName = user?.Roles?.[0]?.name;

  useEffect(() => {
    dispatch(fetchAgents())
    dispatch(fetchSubAccounts())
  }, [dispatch])

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
    console.log(userData)
      setLocalUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    localUser?.roles?.forEach((role: Role) => {
      console.log(`Role: ${role.name}`);
    });
  }, [localUser]);


  return (
    <div className="flex-1 overflow-auto">
      {status === "loading" && <LoadingOverlay />}
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {localUser?.company_name ? `${localUser.company_name} Agent` : "Agent"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {localUser?.roles?.some((role: Role) => role.id == 1)
                ? "Manage your agents and their sub-accounts"
                : "Manage your agents"}
              {localUser?.roles?.map((role: Role) => {
                console.log(`Role: ${role.name}`);
                return null;
              })}
            </p>

          </div>
          <PermissionWrapper componentName="CreateAgent">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-none"
              onClick={() => router.push("/agent/0")}
            >
              Add New Agent
            </Button>
          </PermissionWrapper>
        </div>

        {/* <div className="flex items-center gap-3">
          <PermissionWrapper componentName="CreateAgent">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-600"
              onClick={() => router.push("/quick-create")}
            >
              <span className="mr-2">+</span> Quick Create
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
        </div> */}

        {/* Render agent list in horizontal scrollable row */}
        <div className="flex gap-4 overflow-x-auto pt-6 min-h-[320px] pl-4 scroll-px-4 pb-6 agent-tiles-scroll">
          {status === 'loading' && <p>Loading...</p>}
          {status === 'failed' && (
            <div className="min-w-[200px] text-center p-4">
              <p className="text-red-500">Unable to load agents. Please try again later.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => dispatch(fetchAgents())}
              >
                Retry
              </Button>
            </div>
          )}
          {status === 'succeeded' && agents.length === 0 && (
            <div className="min-w-[300px] text-center p-4">
              <p className="text-gray-500">No agents found. Create your first agent to get started.</p>
            </div>
          )}
          {status === 'succeeded' && (agents as Agent[]).map((agent: Agent, idx: number) => (
            <div
              key={agent.id}
              className="min-w-[300px] sm:min-w-[380px] md:min-w-[420px] md:max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => {
                dispatch(setSelectedAgent(agent))
                router.push(`/agent/${agent.id}`)
              }}
            >
              <h2 className="text-lg font-semibold mb-2">Agent {idx + 1}</h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <User className="w-7 h-7 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-gray-900">{agent.name || 'Unknown User'}</div>
                  <div className="text-sm text-purple-400 font-medium mt-0.5">{agent.User?.company_name || 'Sales Team'}</div>
                </div>
                <PermissionWrapper componentName="DeleteAgent">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this agent?')) {
                        dispatch(deleteAgent(agent.id));
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </PermissionWrapper>
              </div>
              <div className="flex justify-between w-full mb-4">
                <div className="text-left">
                  <div className="text-xs text-gray-400 font-medium">Total Calls</div>
                  <div className="font-bold text-gray-900 text-base">{agent.total_calls}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-medium">Success Rate</div>
                  <div className="font-bold text-gray-900 text-base">{agent.success_rate}</div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full font-semibold text-base border-gray-200"
                onClick={e => {
                  e.stopPropagation();
                  dispatch(setSelectedAgent(agent));
                  router.push(`/agent/${agent.id}`);
                }}
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Sub-Accounts Table Section */}

      <PermissionWrapper componentName="Subaccount">
      <div className="bg-white rounded-xl shadow px-8">
        <div className="overflow-x-auto h-[260px] scrollbar-thin" style={{ scrollbarGutter: 'stable both' }}>
          <h2 className="text-xl font-bold mb-1">Agents Sub-Accounts</h2>
          <p className="text-gray-500 text-sm mb-4">Manage all agent sub-accounts and their performance</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="px-4 py-1 rounded-md text-sm font-medium text-white bg-purple-600">All Sub-Accounts</button>
            </div>
            <div className="ml-auto relative">
              <input type="text" placeholder="Search by company or ager" className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              <span className="absolute right-3 top-2.5 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx="7" cy="7" r="6"/><line x1="11" y1="11" x2="15" y2="15"/></svg>
              </span>
            </div>
          </div>
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monthly C Avg Cost</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {useSelector((state: RootState) => state.auth.subaccounts)?.map((sub: SubAccount) => {
                  const subaccountAgents = (agents as Agent[]).filter(agent => 
                    agent.User?.roles?.some((role: Role) => role.id === sub.id)
                  );
                  const avgSuccessRate = subaccountAgents.length > 0
                    ? (subaccountAgents.reduce((sum, agent) => {
                        const successRateNumber = parseFloat(agent.success_rate?.replace('%', '') || '0');
                        return sum + successRateNumber;
                      }, 0) / subaccountAgents.length).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={sub.id}>
                      <td className="px-4 py-2">{sub.Users[0].company_name} </td>
                      <td className="px-4 py-2">${sub.total_call_cost || '0.00'}</td>
                      <td className="px-4 py-2">{avgSuccessRate}%</td>
                      <td className="px-4 py-2">
                        <a href="#" className="text-purple-600 hover:underline">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline feather feather-external-link"><path d="M18 13v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </PermissionWrapper>
    </div>
  )
}

