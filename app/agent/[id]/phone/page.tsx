"use client"

import { useState, useEffect } from "react"
import { Phone, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { fetchPhoneNumbers } from "@/store/phoneNumberSlice" // Adjust the import path as necessary
import { AppDispatch, RootState } from "@/store/store"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useParams } from "next/navigation"
import { fetchAgentById } from "@/store/agentSlice"

export default function PhoneActivation() {
  const { id } = useParams()
  const [hasNumbers, setHasNumbers] = useState(true)
  const dispatch = useDispatch<AppDispatch>()
  const phoneNumbers = useSelector((state: RootState) => state.phoneNumbers.data)
//   const phoneNumbersStatus = useSelector((state: RootState) => state.phoneNumbers.status) 
  const agent = useSelector((state: RootState) => state.agent.selectedAgent) 
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load both agent and phone numbers
        await Promise.all([
          dispatch(fetchAgentById(parseInt(id as string))).unwrap(),
          dispatch(fetchPhoneNumbers()).unwrap().then(numbers => {
            setHasNumbers(numbers.length > 0)
          })
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    loadData()
  }, [dispatch, id])

  // Toggle inbound status for a phone number
  const toggleInbound = async (phone_number_sid: string) => {
    const phoneNumber = phoneNumbers.find(p => p.phone_number_sid === phone_number_sid);
    if (!phoneNumber) return;

    const isCurrentlyInbound = phoneStatuses[phone_number_sid]?.inbound;
    
    try {
      const response = await axios.patch('https://retell-demo-be-cfbda6d152df.herokuapp.com/update-phone-number', {
        phone_number: phoneNumber.phone_number,
        inbound_agent_id: isCurrentlyInbound ? null : agent?.retell_agent_id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // Update local state only if the API call was successful
      if (response.data.phone_number) {
        setPhoneStatuses(prev => ({
          ...prev,
          [phone_number_sid]: {
            ...prev[phone_number_sid],
            inbound: !isCurrentlyInbound
          }
        }));
      } else {
        // Reset the toggle if response doesn't match expected format
        setPhoneStatuses(prev => ({
          ...prev,
          [phone_number_sid]: {
            ...prev[phone_number_sid],
            inbound: isCurrentlyInbound
          }
        }));
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      // Reset the toggle on error
      setPhoneStatuses(prev => ({
        ...prev,
        [phone_number_sid]: {
          ...prev[phone_number_sid],
          inbound: isCurrentlyInbound
        }
      }));
    }
  }

  // Toggle outbound status for a phone number
  const toggleOutbound = async (phone_number_sid: string) => {
    const phoneNumber = phoneNumbers.find(p => p.phone_number_sid === phone_number_sid);
    if (!phoneNumber) return;

    try {
      const isCurrentlyOutbound = phoneStatuses[phone_number_sid]?.outbound;
      const payload = isCurrentlyOutbound ? {} : { phone_number: phoneNumber.phone_number };

      const response = await axios.put(
        `https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${id}/outbound-phone`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Outbound phone number updated successfully") {
        // Update all numbers to false first
        const updatedStatuses = { ...phoneStatuses };
        Object.keys(updatedStatuses).forEach(sid => {
          updatedStatuses[sid] = {
            ...updatedStatuses[sid],
            outbound: false
          };
        });

        // Then set the current number to true if we're enabling it
        if (!isCurrentlyOutbound) {
          updatedStatuses[phone_number_sid] = {
            ...updatedStatuses[phone_number_sid],
            outbound: true
          };
        }

        setPhoneStatuses(updatedStatuses);
      }
    } catch (error) {
      console.error('Error updating outbound phone number:', error);
      // Reset the toggle on error
      setPhoneStatuses(prev => ({
        ...prev,
        [phone_number_sid]: {
          ...prev[phone_number_sid],
          outbound: false
        }
      }));
    }
  }

  const checkIsInbound = async (phone_number: string) => {
    try {
      const response = await axios.get(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${id}/check-phone-number/${phone_number}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Assuming JWT is stored in localStorage
        }
      });
      
      return response.data.belongs;
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false;
    }
  }

  const checkIsOutbound = async (phone_number: string) => {
    // Similar implementation as checkIsInbound
    const phoneNumber = phoneNumbers.find(p => p.phone_number === phone_number);
    if(agent?.outbound_phone === phoneNumber?.id) {
      return true;
    }
    return false; // For now, using the same check
  }

  // Update the phone number mapping to handle async checks
  const [phoneStatuses, setPhoneStatuses] = useState<Record<string, { inbound: boolean, outbound: boolean }>>({});

  useEffect(() => {
    // Load initial statuses for all phone numbers
    const loadPhoneStatuses = async () => {
      const statuses: Record<string, { inbound: boolean, outbound: boolean }> = {};
      
      for (const phone of phoneNumbers) {
        const inbound = await checkIsInbound(phone.phone_number);
        const outbound = await checkIsOutbound(phone.phone_number);
        statuses[phone.phone_number_sid] = { inbound, outbound };
      }
      
      setPhoneStatuses(statuses);
    };

    if (phoneNumbers.length > 0) {
      loadPhoneStatuses();
    }
  }, [phoneNumbers, id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 mt-6">
          <div className="flex items-center mb-1">
          <div className="mb-4">
          <Button variant="outline" onClick={() => router.push(`/agent/${id}`)}>
            Back
          </Button>
        </div>
          </div>
          <h1 className="text-2xl font-bold">Phone Activation</h1>
         
        </div>

        {/* Phone Number Assignment Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <Phone className="mr-2 text-gray-700" />
            <h2 className="text-xl font-semibold">Assign Phone Number</h2>
          </div>

          {hasNumbers ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="font-medium">Phone Number</div>
                <div className="flex space-x-6">
                  <div className="text-sm font-medium w-16 text-center">Inbound</div>
                  <div className="text-sm font-medium w-16 text-center">Outbound</div>
                </div>
              </div>

              {phoneNumbers.map((phone) => (
                <div key={phone.phone_number_sid} className="flex justify-between items-center py-2">
                  <div className="font-medium">{phone.phone_number}</div>
                  <div className="flex space-x-6">
                    <div className="flex justify-center w-16">
                      <Switch 
                        checked={phoneStatuses[phone.phone_number_sid]?.inbound || false} 
                        onCheckedChange={() => toggleInbound(phone.phone_number_sid)} 
                      />
                    </div>
                    <div className="flex justify-center w-16">
                      <Switch 
                        checked={phoneStatuses[phone.phone_number_sid]?.outbound || false} 
                        onCheckedChange={() => toggleOutbound(phone.phone_number_sid)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">
                You don&apos;t have any phone numbers yet. Purchase a number to get started.
              </p>
              <Button className="bg-black hover:bg-gray-800 text-white" onClick={() => router.push(`/phone-numbers`)}>
                <Plus size={16} className="mr-2" />
                Purchase Phone Number
              </Button>
            </div>
          )}
        </div>

        {/* Demo Controls (for demonstration purposes) */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium mb-4">Demo Controls</h3>
          <Button variant="outline" onClick={() => setHasNumbers(!hasNumbers)} className="w-full">
            {hasNumbers ? "Show Empty State" : "Show Phone Numbers"}
          </Button>
        </div> */}
      </div>
    </div>
  )
}

