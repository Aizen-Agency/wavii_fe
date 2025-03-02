"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDispatch, useSelector } from "react-redux"
import { fetchAvailableNumbers, registerToTrunk } from "@/store/phoneNumberSlice"
import { AppDispatch, RootState } from "@/store/store"

interface AddTwilioNumberModalProps {
  open: boolean
  onClose: () => void
}

const countryOptions = [
  { code: 'af', label: 'Afghanistan (‫افغانستان‬‎)' },
  { code: 'al', label: 'Albania (Shqipëri)' },
  { code: 'dz', label: 'Algeria (‫الجزائر‬‎)' },
  { code: 'as', label: 'American Samoa' },
  { code: 'ad', label: 'Andorra' },
  { code: 'ao', label: 'Angola' },
  { code: 'ag', label: 'Antigua and Barbuda' },
  { code: 'ar', label: 'Argentina' },
  { code: 'am', label: 'Armenia (Հայաստան)' },
  { code: 'aw', label: 'Aruba' },
  { code: 'au', label: 'Australia' },
  { code: 'at', label: 'Austria (Österreich)' },
  { code: 'az', label: 'Azerbaijan (Azərbaycan)' },
  { code: 'us', label: 'United States' },
  { code: 'gb', label: 'United Kingdom' }
]

export function AddTwilioNumberModal({ open, onClose }: AddTwilioNumberModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const availableNumbers = useSelector((state: RootState) => state.phoneNumbers.availableNumbers)
  const [selectedNumber, setSelectedNumber] = useState("")
  const [accountSid, setAccountSid] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [countryCode, setCountryCode] = useState("")

  const handleFetchNumbers = () => {
    // Dispatch action to fetch available numbers with country code
    dispatch(fetchAvailableNumbers({ accountSid: accountSid, authToken: authToken, countryCode: countryCode }))
  }

  const handleActivateNumber = () => {
    // Dispatch action to activate the selected number
    if (selectedNumber) {
      dispatch(registerToTrunk({ phonesid: selectedNumber, accountSid: accountSid, authToken: authToken }))
    }
  }

  console.log(availableNumbers)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Twilio Number</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="account-sid">Account SID</Label>
            <Input id="account-sid" placeholder="Enter your Twilio Account SID" onChange={(e) => setAccountSid(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="auth-token">Auth Token</Label>
            <Input id="auth-token" type="password" placeholder="Enter your Twilio Auth Token" onChange={(e) => setAuthToken(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country-code">Country</Label>
            <select id="country-code" onChange={(e) => setCountryCode(e.target.value)} value={countryCode}>
              <option value="">Select a country</option>
              {countryOptions.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
          {/* <div className="grid gap-2">
            <Label htmlFor="twilio-number">Twilio Phone Number</Label>
            <Input id="twilio-number" placeholder="+1 (555) 000-0000" type="tel" />
          </div> */}
          <Button onClick={handleFetchNumbers}>Get Available Numbers</Button>
          <select onChange={(e) => {
            setSelectedNumber(e.target.value);
            console.log(`Selected number: ${e.target.value}`);
          }} value={selectedNumber}>
            <option value="">Select a number</option>
            {availableNumbers.map((number) => (
              <option key={number.phone_number_sid || number.phone_number} value={number.phone_number_sid || number.phone_number}>
                {number.friendly_name}
              </option>
            ))}
          </select>
          <Button onClick={handleActivateNumber}>Activate Number</Button>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">Add Twilio Number</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

