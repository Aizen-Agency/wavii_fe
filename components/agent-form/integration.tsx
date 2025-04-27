import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {    Link2, FileSpreadsheet } from "lucide-react"
import { useDispatch } from "react-redux"     
import { useEffect } from "react"
import { AppDispatch } from "@/store/store"
import { integrateCalendar as integrateCalendarThunk, fetchAgentById } from "@/store/agentSlice"
import PermissionWrapper from "../PermissionWrapper"
import { usePermissionContext } from "@/contexts/PermissionContext"

interface FormData {
  id: number
  workingHours: string
  cal_key: string
  cal_event_id: string
}

interface IntegrationProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export function Integration({ formData, updateFormData }: IntegrationProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { checkPermission } = usePermissionContext();
  const canEditCalendar = checkPermission(12, 4);

  useEffect(() => {
    if (formData.id) {
      dispatch(fetchAgentById(formData.id))
    }
  }, [dispatch, formData.id])

  const handleIntegrateCalendar = () => {
    dispatch(
      integrateCalendarThunk({
        agent_id: formData.id,
        cal_api_key: formData.cal_key,
        event_type_id: parseInt(formData.cal_event_id, 10),
      })
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" className="w-full justify-start gap-2 text-gray-400" disabled>
        <Link2 className="w-4 h-4" />
        Connect CRM
        <span className="ml-auto text-xs">(Coming Soon)</span>
      </Button>

      {/* <Button variant="outline" className="w-full justify-start gap-2">
        <Calendar className="w-4 h-4" />
        Connect Google Calendar
      </Button> */}

      <Button variant="outline" className="w-full justify-start gap-2 text-gray-400" disabled>
        <FileSpreadsheet className="w-4 h-4" />
        Connect Google Sheets
        <span className="ml-auto text-xs">(Coming Soon)</span>
      </Button>

      <div className="space-y-2">
        <Label>Working Hours</Label>
        <Input
        disabled={true}
          placeholder="e.g., Mon-Fri 9AM-5PM"
          value={formData.workingHours}
          onChange={(e) => updateFormData({ workingHours: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Calendar API Key</Label>
        <Input
          placeholder="Enter your calendar API key"
          value={formData.cal_key} 
          disabled={!canEditCalendar}
          onChange={(e) => updateFormData({ cal_key: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Calendar Event ID</Label>
        <Input
          placeholder="Enter your calendar event ID"
          value={formData.cal_event_id}
          disabled={!canEditCalendar}
          onChange={(e) => updateFormData({ cal_event_id: e.target.value })}
        />
      </div>

        <PermissionWrapper componentName="EditCalendar">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={handleIntegrateCalendar}
      >
        Integrate Calendar
      </Button>
      </PermissionWrapper>
    </div>
  )
}

