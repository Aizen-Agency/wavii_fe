import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { toast } from "react-toastify"

interface CalSchedule {
  id: number
  ownerId: number
  name: string
  timeZone: string
  availability: {
    days: string[]
    startTime: string
    endTime: string
  }[]
  isDefault: boolean
  overrides: {
    date: string
    startTime: string
    endTime: string
  }[]
}

interface LocalSchedule {
  id: number
  agent_id: string
  name: string
  timeZone: string
  isDefault: boolean
  availability: {
    days: string[]
    startTime: string
    endTime: string
  }[]
  overrides: {
    date: string
    startTime: string
    endTime: string
  }[]
  cal_schedule_id: number
  createdAt: string
  updatedAt: string
}

interface ScheduleResponse {
  status: string
  data: CalSchedule[]
  local_schedules: LocalSchedule[]
  error: Record<string, unknown>
}

interface ScheduleManagementProps {
  agentId: string
}

export function ScheduleManagement({ agentId }: ScheduleManagementProps) {
  const [schedules, setSchedules] = useState<ScheduleResponse | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState<CalSchedule | LocalSchedule | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    timeZone: "America/New_York",
    availability: [{ days: [] as string[], startTime: "", endTime: "" }],
    isDefault: false,
    overrides: [{ date: "", startTime: "", endTime: "" }]
  })

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeZones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Rome",
    "Asia/Tokyo",
    "Australia/Sydney"
  ]

  useEffect(() => {
    fetchSchedules()
  }, [agentId])

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch schedules')
      const data: ScheduleResponse = await response.json()
      setSchedules(data)
    } catch (error) {
      console.error('Failed to fetch schedules', error)
      toast.error('Failed to fetch schedules')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('access_token')
      const url = isEditing && currentSchedule
        ? `https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/schedules/${currentSchedule.id}`
        : `https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/schedules`

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save schedule')
      
      toast.success(`Schedule ${isEditing ? 'updated' : 'created'} successfully`)
      fetchSchedules()
      resetForm()
    } catch (error) {
      console.error('Failed to save schedule', error)
      toast.error('Failed to save schedule')
    }
  }

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete schedule')
      
      toast.success('Schedule deleted successfully')
      fetchSchedules()
    } catch (error) {
      console.error('Failed to delete schedule', error)
      toast.error('Failed to delete schedule')
    }
  }

  const handleEdit = (schedule: CalSchedule | LocalSchedule) => {
    setCurrentSchedule(schedule)
    setFormData({
      name: schedule.name,
      timeZone: schedule.timeZone,
      availability: schedule.availability,
      isDefault: schedule.isDefault,
      overrides: schedule.overrides
    })
    setIsEditing(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      timeZone: "America/New_York",
      availability: [{ days: [] as string[], startTime: "", endTime: "" }],
      isDefault: false,
      overrides: [{ date: "", startTime: "", endTime: "" }]
    })
    setIsEditing(false)
    setCurrentSchedule(null)
  }

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { days: [] as string[], startTime: "", endTime: "" }]
    }))
  }

  const addOverride = () => {
    setFormData(prev => ({
      ...prev,
      overrides: [...prev.overrides, { date: "", startTime: "", endTime: "" }]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Schedule Management</h2>
        <Button onClick={resetForm} className="gap-2">
          <Plus className="w-4 h-4" />
          New Schedule
        </Button>
      </div>

      {/* Schedule Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Schedule Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Regular Hours"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select
              value={formData.timeZone}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timeZone: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <Label>Availability</Label>
            {formData.availability.map((availability, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Days</Label>
                  <Select
                    value={availability.days.join(',')}
                    onValueChange={(value) => {
                      const newAvailability = [...formData.availability]
                      newAvailability[index].days = value.split(',')
                      setFormData(prev => ({ ...prev, availability: newAvailability }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={availability.startTime}
                      onChange={(e) => {
                        const newAvailability = [...formData.availability]
                        newAvailability[index].startTime = e.target.value
                        setFormData(prev => ({ ...prev, availability: newAvailability }))
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={availability.endTime}
                      onChange={(e) => {
                        const newAvailability = [...formData.availability]
                        newAvailability[index].endTime = e.target.value
                        setFormData(prev => ({ ...prev, availability: newAvailability }))
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAvailability} className="w-full">
              Add Availability
            </Button>
          </div>

          {/* Overrides */}
          <div className="space-y-4">
            <Label>Overrides</Label>
            {formData.overrides.map((override, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={override.date}
                    onChange={(e) => {
                      const newOverrides = [...formData.overrides]
                      newOverrides[index].date = e.target.value
                      setFormData(prev => ({ ...prev, overrides: newOverrides }))
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={override.startTime}
                      onChange={(e) => {
                        const newOverrides = [...formData.overrides]
                        newOverrides[index].startTime = e.target.value
                        setFormData(prev => ({ ...prev, overrides: newOverrides }))
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={override.endTime}
                      onChange={(e) => {
                        const newOverrides = [...formData.overrides]
                        newOverrides[index].endTime = e.target.value
                        setFormData(prev => ({ ...prev, overrides: newOverrides }))
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOverride} className="w-full">
              Add Override
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4"
            />
            <Label htmlFor="isDefault">Set as default schedule</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Schedule List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cal.com Schedules</h3>
        {schedules?.data.map(schedule => (
          <Card key={schedule.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{schedule.name}</h4>
                <p className="text-sm text-gray-500">{schedule.timeZone}</p>
                {schedule.isDefault && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(schedule)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <h3 className="text-lg font-semibold mt-8">Local Schedules</h3>
        {schedules?.local_schedules.map(schedule => (
          <Card key={schedule.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{schedule.name}</h4>
                <p className="text-sm text-gray-500">{schedule.timeZone}</p>
                {schedule.isDefault && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Default
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(schedule.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(schedule)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 