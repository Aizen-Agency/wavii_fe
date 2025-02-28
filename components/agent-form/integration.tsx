import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Link2, FileSpreadsheet } from "lucide-react"

interface FormData {
  workingHours: string
}

interface IntegrationProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export function Integration({ formData, updateFormData }: IntegrationProps) {
  return (
    <div className="space-y-6">
      <Button variant="outline" className="w-full justify-start gap-2 text-gray-400" disabled>
        <Link2 className="w-4 h-4" />
        Connect CRM
        <span className="ml-auto text-xs">(Coming Soon)</span>
      </Button>

      <Button variant="outline" className="w-full justify-start gap-2">
        <Calendar className="w-4 h-4" />
        Connect Google Calendar
      </Button>

      <Button variant="outline" className="w-full justify-start gap-2 text-gray-400" disabled>
        <FileSpreadsheet className="w-4 h-4" />
        Connect Google Sheets
        <span className="ml-auto text-xs">(Coming Soon)</span>
      </Button>

      <div className="space-y-2">
        <Label>Working Hours</Label>
        <Input
          placeholder="e.g., Mon-Fri 9AM-5PM"
          value={formData.workingHours}
          onChange={(e) => updateFormData({ workingHours: e.target.value })}
        />
      </div>
    </div>
  )
}

