"use client"

import { useState, useEffect } from "react"
import { Search, Plus, LayoutGrid, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddPhoneNumberModal } from "@/components/phone-numbers/add-phone-number-modal"
import { AddTwilioNumberModal } from "@/components/phone-numbers/add-twilio-number-modal"
import { useDispatch, useSelector } from "react-redux"
import { fetchPhoneNumbers, deletePhoneNumber } from "@/store/phoneNumberSlice"
import { fetchAgents, fetchAgentById } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import LoadingOverlay from "@/components/loadingOverlay"
import { fetchTwilioAccounts, setSelectedAccount } from "@/store/twilioSlice"
import PermissionWrapper from "@/components/PermissionWrapper"

export default function PhoneNumbersPage() {
  const [isAddPhoneNumberOpen, setIsAddPhoneNumberOpen] = useState(false)
  const [isAddTwilioNumberOpen, setIsAddTwilioNumberOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const dispatch = useDispatch<AppDispatch>();
  const phoneNumbers = useSelector((state: RootState) => state.phoneNumbers.data);
  const phoneNumbersStatus = useSelector((state: RootState) => state.phoneNumbers.status);
  const phoneNumbersError = useSelector((state: RootState) => state.phoneNumbers.error);
  const twilioAccounts = useSelector((state: RootState) => state.twilio.accounts);
  const selectedAccountId = useSelector((state: RootState) => state.twilio.selectedAccountId);
  
  useEffect(() => {
    if (phoneNumbersStatus === 'idle') {
      dispatch(fetchPhoneNumbers());
    }
    dispatch(fetchAgents());
    dispatch(fetchTwilioAccounts());
  }, [phoneNumbersStatus, dispatch]);

  const handleTwilioAccountChange = (accountId: string) => {
    dispatch(setSelectedAccount(parseInt(accountId)));
  };

  const handleTwilioNumberSuccess = () => {
    dispatch(fetchPhoneNumbers());
  };

  const handleDeletePhoneNumber = async (phoneNumber: string) => {
    if (window.confirm('Are you sure you want to delete this phone number?')) {
      try {
        await dispatch(deletePhoneNumber({ phoneNumber, accountId: selectedAccountId })).unwrap();
        dispatch(fetchPhoneNumbers());
      } catch (error) {
        console.error('Error deleting phone number:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {phoneNumbersStatus === "loading" && <LoadingOverlay />}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Phone Numbers</h1>
          <Select 
            value={selectedAccountId?.toString()} 
            onValueChange={handleTwilioAccountChange}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Twilio Account" />
            </SelectTrigger>
            <SelectContent>
              {twilioAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.friendly_name}
                  {account.is_default && " (Default)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-4">
          <PermissionWrapper componentName="CreateNumbers">
          <Button
            className="bg-[#9F7AEA] hover:bg-[#9F7AEA]/90 text-white gap-2"
            onClick={() => setIsAddTwilioNumberOpen(true)}
            disabled={!selectedAccountId}
          >
            <Plus className="h-4 w-4" />
            Add Twilio Number
          </Button>
          </PermissionWrapper>
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
            <div className="text-sm font-medium text-purple-600">Actions</div>
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
                  <div>
                    <PermissionWrapper componentName="DeleteNumbers">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeletePhoneNumber(phoneNumber.phone_number)}
                    >
                      Delete
                    </Button>
                    </PermissionWrapper>  
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

      <AddPhoneNumberModal 
        open={isAddPhoneNumberOpen} 
        onClose={() => setIsAddPhoneNumberOpen(false)} 
      />

      <AddTwilioNumberModal 
        open={isAddTwilioNumberOpen} 
        onClose={() => setIsAddTwilioNumberOpen(false)}
        onSuccess={handleTwilioNumberSuccess}
        twilioAccountId={selectedAccountId}
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

