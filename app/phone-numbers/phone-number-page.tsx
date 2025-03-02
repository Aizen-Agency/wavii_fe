"use client"

import { useState, useEffect } from "react"
import { Search, Plus, LayoutGrid, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddPhoneNumberModal } from "@/components/phone-numbers/add-phone-number-modal"
import { AddTwilioNumberModal } from "@/components/phone-numbers/add-twilio-number-modal"
import { useDispatch, useSelector } from "react-redux"
import { fetchPhoneNumbers } from "@/store/phoneNumberSlice"
import { fetchAgents, fetchAgentById } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import LoadingOverlay from "@/components/loadingOverlay"



export default function PhoneNumbersPage() {
  const [isAddPhoneNumberOpen, setIsAddPhoneNumberOpen] = useState(false)
  const [isAddTwilioNumberOpen, setIsAddTwilioNumberOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const dispatch = useDispatch<AppDispatch>();
  const phoneNumbers = useSelector((state: RootState) => state.phoneNumbers.data);
  const phoneNumbersStatus = useSelector((state: RootState) => state.phoneNumbers.status);
  const phoneNumbersError = useSelector((state: RootState) => state.phoneNumbers.error);
  
  console.log(phoneNumbers);
  useEffect(() => {
    if (phoneNumbersStatus === 'idle') {
      dispatch(fetchPhoneNumbers());
    }
    dispatch(fetchAgents())
  }, [phoneNumbersStatus, dispatch, phoneNumbers, phoneNumbersError]);
  
  // const getAgentName = async (agentId: string) => {
  //   if (!agentId) return "";
  //   try {
  //     const agent = await dispatch(fetchAgentById(parseInt(agentId))).unwrap();
  //     return agent ? agent.name : "";
  //   } catch (error) {
  //     console.error("Error fetching agent:", error);
  //     return "";
  //   }
  // };

  const handleTwilioNumberSuccess = () => {
    dispatch(fetchPhoneNumbers())
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {phoneNumbersStatus === "loading" && <LoadingOverlay />}
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Phone Numbers</h1>

        <div className="flex flex-wrap gap-4">
          {/* <Button
            className="bg-[#E9D8FD] hover:bg-[#E9D8FD]/90 text-black gap-2"
            onClick={() => setIsAddPhoneNumberOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Phone Number
          </Button> */}
          <Button
            className="bg-[#9F7AEA] hover:bg-[#9F7AEA]/90 text-white gap-2"
            onClick={() => setIsAddTwilioNumberOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Twilio Number
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search phone numbers..." className="pl-10" />
          </div>

          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === "list" ? "bg-gray-100" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="grid grid-cols-5 gap-4 p-4 border-b">
            <div className="text-sm font-medium text-purple-600">Phone Number</div>
            <div className="text-sm font-medium text-purple-600">Status</div>
            <div className="text-sm font-medium text-purple-600">Assigned Agent</div>
          </div>

          {phoneNumbersStatus === 'succeeded' && phoneNumbers && phoneNumbers.length > 0 && (
            <div>
              {phoneNumbers.map((phoneNumber) => (
                <div key={phoneNumber.phone_number} className="grid grid-cols-5 gap-4 p-4 border-b">
                  <div>{phoneNumber.phone_number}</div>
                  <div>ACTIVE</div>
                  <div>
                    {phoneNumber.agent_id ? (
                      <AgentName agentId={phoneNumber.agent_id} />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {phoneNumbersStatus === 'succeeded' && phoneNumbers && phoneNumbers.length === 0 && (
            <div className="p-8 text-center text-gray-500">No phone numbers found</div>
          )}

          {phoneNumbersStatus === 'failed' && (
            <div className="p-8 text-center text-red-500">
              Error loading phone numbers: {phoneNumbersError}
            </div>
          )}
        </div>
      </div>

      <AddPhoneNumberModal open={isAddPhoneNumberOpen} onClose={() => setIsAddPhoneNumberOpen(false)} />

      <AddTwilioNumberModal 
        open={isAddTwilioNumberOpen} 
        onClose={() => setIsAddTwilioNumberOpen(false)}
        onSuccess={handleTwilioNumberSuccess}
      />
    </div>
  )
}

function AgentName({ agentId }: { agentId: string }) {
  const [agentName, setAgentName] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadAgentName = async () => {
      try {
        const agent = await dispatch(fetchAgentById(parseInt(agentId))).unwrap();
        setAgentName(agent?.name || "");
      } catch (error) {
        console.error("Error fetching agent:", error);
        setAgentName("Error loading agent");
      }
    };

    loadAgentName();
  }, [agentId, dispatch]);

  return <span>{agentName || "Loading..."}</span>;
}

