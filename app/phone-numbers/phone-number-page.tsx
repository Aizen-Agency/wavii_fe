"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddPhoneNumberModal } from "@/components/phone-numbers/add-phone-number-modal"
import { useDispatch, useSelector } from "react-redux"
import { fetchPhoneNumbers } from "@/store/phoneNumberSlice"
import { fetchAgents } from "@/store/agentSlice"
import { AppDispatch, RootState } from "@/store/store"
import { fetchTwilioAccounts } from "@/store/twilioSlice"

interface PhoneNumber {
  phone_number: string;
  phone_number_name?: string;
  sub_account?: string;
  sub_account_name?: string;
  country?: string;
  country_name?: string;
  assignment_status?: string;
}

export default function PhoneNumbersPage() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isAddPhoneNumberOpen, setIsAddPhoneNumberOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const phoneNumbers = useSelector((state: RootState) => state.phoneNumbers.data);
  const phoneNumbersStatus = useSelector((state: RootState) => state.phoneNumbers.status);
  
  useEffect(() => {
    if (phoneNumbersStatus === 'idle') {
      dispatch(fetchPhoneNumbers());
    }
    dispatch(fetchAgents());
    dispatch(fetchTwilioAccounts());
  }, [phoneNumbersStatus, dispatch]);

  // Filtered phone numbers by search
  const mappedPhoneNumbers = phoneNumbers.map((pn: PhoneNumber) => ({
    ...pn,
    phone_number_name: pn.phone_number_name ?? "",
    sub_account: pn.sub_account ?? "",
    sub_account_name: pn.sub_account_name ?? "",
    country: pn.country ?? "",
    country_name: pn.country_name ?? "",
    assignment_status: pn.assignment_status ?? "",
  }));

  const filteredNumbers = mappedPhoneNumbers.filter(pn =>
    pn.phone_number.includes(search) ||
    pn.phone_number_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Select first phone by default
  useEffect(() => {
    if (!selectedPhone && filteredNumbers.length > 0) {
      setSelectedPhone(filteredNumbers[0].phone_number);
    }
  }, [filteredNumbers, selectedPhone]);

  const selectedPhoneObj = filteredNumbers.find(pn => pn.phone_number === selectedPhone);

  // const handleTwilioAccountChange = (accountId: string) => {
  //   dispatch(setSelectedAccount(parseInt(accountId)));
  // };

  // const handleTwilioNumberSuccess = () => {
  //   dispatch(fetchPhoneNumbers());
  // };

  // const handleDeletePhoneNumber = async (phoneNumber: string) => {
  //   if (window.confirm('Are you sure you want to delete this phone number?')) {
  //     try {
  //       await dispatch(deletePhoneNumber({ phoneNumber, accountId: selectedAccountId })).unwrap();
  //       dispatch(fetchPhoneNumbers());
  //     } catch (error) {
  //       console.error('Error deleting phone number:', error);
  //     }
  //   }
  // };

  return (
    <div className="min-h-screen bg-white px-2 py-4 sm:px-4 md:px-8 lg:px-12">
      {/* Header */}
      <div className="mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Phone</h1>
        <p className="text-gray-500">Manage your phone numbers and call settings</p>
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 max-w-6xl mx-auto">
        <button className="flex items-center px-4 py-2 rounded-lg bg-white border font-medium text-sm text-purple-700 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 mr-2">
          <span className="mr-2"><PhoneIcon className="w-4 h-4" /></span>Phone Numbers
        </button>
        <button className="flex items-center px-4 py-2 rounded-lg bg-white border font-medium text-sm text-gray-500 border-gray-200">Docs</button>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4 max-w-6xl mx-auto">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsAddPhoneNumberOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Create Phone Number
        </Button>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by phone..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Main Panel Layout */}
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Left: Phone List */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col gap-2">
          {filteredNumbers.map((pn) => (
            <div
              key={pn.phone_number}
              className={`rounded-lg border px-4 py-3 cursor-pointer ${selectedPhone === pn.phone_number ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'} transition`}
              onClick={() => setSelectedPhone(pn.phone_number)}
            >
              <div className="font-bold text-lg">{pn.phone_number}</div>
              <div className="text-xs text-gray-500">{pn.phone_number_name || 'No Name'}</div>
              <div className="text-xs text-purple-600 font-medium">{pn.assignment_status || 'Unassigned'}</div>
            </div>
          ))}
        </div>
        {/* Right: Phone Details */}
        <div className="flex-1 bg-white rounded-lg border p-4 sm:p-6 md:p-8 min-h-[400px] overflow-x-auto">
          {selectedPhoneObj ? (
            <>
              <div className="text-2xl font-bold mb-1">{selectedPhoneObj.phone_number}</div>
              <div className="text-gray-500 mb-6">This number was imported from your Twilio account.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone Number Name</label>
                  <Input value={selectedPhoneObj.phone_number_name || ''} readOnly />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sub-Account</label>
                  <Input value={selectedPhoneObj.sub_account || 'Unassigned'} readOnly />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sub-Account Name</label>
                  <Input value={selectedPhoneObj.sub_account_name || 'Unassigned'} readOnly />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Country</label>
                  <Input value={selectedPhoneObj.country || 'Unknown'} readOnly />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Country Name</label>
                  <Input value={selectedPhoneObj.country_name || 'Unknown'} readOnly />
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center mt-20">Select a phone number to view details</div>
          )}
        </div>
      </div>
      <AddPhoneNumberModal open={isAddPhoneNumberOpen} onClose={() => setIsAddPhoneNumberOpen(false)} />
    </div>
  );
}

// Helper: Phone icon
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13.81.35 1.6.65 2.34a2 2 0 0 1-.45 2.11L9.1 10.1a16 16 0 0 0 6.9 6.9l1.93-1.13a2 2 0 0 1 2.11-.45c.74.3 1.53.52 2.34.65A2 2 0 0 1 22 16.92z"></path></svg>
  );
}

// function AgentName({ agentId }: { agentId: string }) {
//   const [agentName, setAgentName] = useState<string>("");
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     const loadAgentName = async () => {
//       try {
//         const agent = await dispatch(fetchAgentById(parseInt(agentId))).unwrap();
//         setAgentName(agent?.name || "");
//       } catch (error) {
//         console.error("Error fetching agent:", error);
//         setAgentName("Error loading agent");
//       }
//     };

//     loadAgentName();
//   }, [agentId, dispatch]);

//   return <span>{agentName || "Loading..."}</span>;
// }

