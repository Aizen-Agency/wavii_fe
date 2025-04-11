"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"
import { fetchAvailableNumbers, fetchTrunks, createTrunk, registerPhoneToTrunk, TrunkInfo, AvailableNumber } from "@/store/twilioSlice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LoadingOverlay from "@/components/loadingOverlay"

interface AddTwilioNumberModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  twilioAccountId: number | null
}

export function AddTwilioNumberModal({ open, onClose, onSuccess, twilioAccountId }: AddTwilioNumberModalProps) {
  const [loading, setLoading] = useState(false)
  const [country, setCountry] = useState("US")
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState("")
  const [selectedNumberSid, setSelectedNumberSid] = useState("")
  const [trunks, setTrunks] = useState<TrunkInfo[]>([])

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (open && twilioAccountId) {
      loadTrunks()
    }
  }, [open, twilioAccountId])

  const loadTrunks = async () => {
    if (!twilioAccountId) return
    try {
      const result = await dispatch(fetchTrunks(twilioAccountId)).unwrap()
      setTrunks(result)
    } catch (error) {
      console.error("Error loading trunks:", error)
    }
  }

  const handleSearch = async () => {
    if (!twilioAccountId) return
    setLoading(true)
    try {
      const numbers = await dispatch(fetchAvailableNumbers({ country, accountId: twilioAccountId })).unwrap()
      setAvailableNumbers(numbers)
      if (numbers.length > 0) {
        setSelectedNumber(numbers[0].phoneNumber)
        setSelectedNumberSid(numbers[0].sid)
      }
    } catch (error) {
      console.error("Error fetching numbers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!twilioAccountId || !selectedNumber) return
    setLoading(true)
    try {
      const trunk = trunks[0] || await dispatch(createTrunk(twilioAccountId)).unwrap()
      console.log("trunk", trunk)
      await dispatch(registerPhoneToTrunk({
        terminationUri: `${trunk.domainName}`,
        trunkSid: trunk.sid,
        accountId: twilioAccountId,
        phoneNumbertoadd: selectedNumber,
        phoneSid: selectedNumberSid
      })).unwrap()
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error registering phone number:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        {loading && <LoadingOverlay />}
        <DialogHeader>
          <DialogTitle>Add Twilio Number</DialogTitle>
          <DialogDescription>
            Search for available numbers and assign them to a trunk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} disabled={loading || !twilioAccountId}>
            Search Numbers
          </Button>

          {availableNumbers.length > 0 && (
            <div className="space-y-2">
              <Label>Available Numbers</Label>
              <Select value={selectedNumber} onValueChange={(value) => {
                const selected = availableNumbers.find(number => number.phoneNumber === value);
                setSelectedNumber(selected ? selected.phoneNumber : value);
                setSelectedNumberSid(selected ? selected.sid : '');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a number" />
                </SelectTrigger>
                <SelectContent>
                  {availableNumbers.map((number) => (
                    <SelectItem key={number.phoneNumber} value={number.phoneNumber}>
                      {number.friendlyName || number.phoneNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedNumber}
          >
            Add Number
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

