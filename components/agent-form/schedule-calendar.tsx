import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, X} from "lucide-react"
import PermissionWrapper from "../PermissionWrapper"

interface TimeSlot {
  startTime: string
  endTime: string
}

interface DaySchedule {
  days: string[]
  slots: TimeSlot[]
}

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

interface ScheduleResponse {
  status: string
  data: CalSchedule[]
  local_schedules: LocalSchedules[]
  error: Record<string, unknown>
}

interface LocalSchedules {
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

interface Booking {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    name: string;
    email: string;
  }>;
}

interface ScheduleCalendarProps {
  agentId: string
}

interface DateAvailabilityResponse {
  date: string
  timeSlots: {
    start: string
    end: string
  }[]
}

interface DateAvailabilityUpdateResponse {
  message: string
  date: string
  timeSlots: {
    start: string
    end: string
  }[]
}

interface DateAvailabilityDeleteResponse {
  message: string
  date: string
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const getFullDayName = (shortDay: string) => {
  const index = shortDays.indexOf(shortDay)
  return index !== -1 ? days[index] : shortDay
}

export function ScheduleCalendar({ agentId }: ScheduleCalendarProps) {
  const [schedules, setSchedules] = useState<ScheduleResponse | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule>({
    days: [],
    slots: [{ startTime: "09:00", endTime: "17:00" }]
  })

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/agents/${agentId}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Calendar is not integrated yet');
          return;
        }
        throw new Error('Failed to fetch bookings')
      }
      const data = await response.json()
      if (data.status === 'success') {
        setBookings(data.data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch bookings', error)
      toast.error('Failed to fetch bookings')
    }
  }

  useEffect(() => {
    fetchSchedules()
    fetchBookings()
  }, [agentId])

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/agents/${agentId}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Calendar is not integrated yet');
          return;
        }
        throw new Error('Failed to fetch schedules')
      }
      const data: ScheduleResponse = await response.json()
      setSchedules(data)
    } catch (error) {
      console.error('Failed to fetch schedules', error)
      toast.error('Failed to fetch schedules')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const getAvailabilityForDay = (dayName: string) => {
    if (!schedules?.data[0]) return []

    const schedule = schedules.data[0]
    const availabilities = schedule.availability.filter(avail => 
      avail.days.some(d => d.toLowerCase() === dayName.toLowerCase())
    )

    return availabilities.map(a => `${a.startTime} - ${a.endTime}`)
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
    })
  }

  const fetchDateAvailability = async (date: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/agents/${agentId}/date-availability/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch date availability')
      const data: DateAvailabilityResponse = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch date availability', error)
      toast.error('Failed to fetch date availability')
      return null
    }
  }

  const updateDateAvailability = async (date: string, timeSlots: { start: string, end: string }[]) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/agents/${agentId}/date-availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          timeSlots
        })
      })
      if (!response.ok) throw new Error('Failed to update date availability')
      const data: DateAvailabilityUpdateResponse = await response.json()
      return data
    } catch (error) {
      console.error('Failed to update date availability', error)
      toast.error('Failed to update date availability')
      return null
    }
  }

  const deleteDateAvailability = async (date: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/agents/${agentId}/date-availability/${date}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to delete date availability')
      const data: DateAvailabilityDeleteResponse = await response.json()
      return data
    } catch (error) {
      console.error('Failed to delete date availability', error)
      toast.error('Failed to delete date availability')
      return null
    }
  }

  const handleEditDay = async (dayName: string, date?: Date) => {
    setSelectedDay(dayName)
    if (date) {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      setSelectedDate(formattedDate)
      const availability = await fetchDateAvailability(formattedDate)
      if (availability) {
        setEditingSchedule({
          days: [dayName],
          slots: availability.timeSlots.map(slot => ({
            startTime: new Date(slot.start).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(slot.end).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          }))
        })
      } else {
        setEditingSchedule({
          days: [dayName],
          slots: [{ startTime: "09:00", endTime: "17:00" }]
        })
      }
    } else {
      const schedule = schedules?.data[0]
      if (schedule) {
        const daySchedules = schedule.availability.filter(avail => 
          avail.days.some(d => d.toLowerCase() === dayName.toLowerCase())
        )
        
        setEditingSchedule({
          days: [dayName],
          slots: daySchedules.length > 0 
            ? daySchedules.map(s => ({ startTime: s.startTime, endTime: s.endTime }))
            : [{ startTime: "09:00", endTime: "17:00" }]
        })
      }
    }
    setIsEditModalOpen(true)
  }

  const addTimeSlot = () => {
    setEditingSchedule(prev => ({
      ...prev,
      slots: [...prev.slots, { startTime: "09:00", endTime: "17:00" }]
    }))
  }

  const removeTimeSlot = (index: number) => {
    setEditingSchedule(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }))
  }

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setEditingSchedule(prev => ({
      ...prev,
      slots: prev.slots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const saveSchedule = async () => {
    try {
      if (selectedDate) {
        const timeSlots = editingSchedule.slots.map(slot => ({
          start: slot.startTime,
          end: slot.endTime
        }))
        const result = await updateDateAvailability(selectedDate, timeSlots)
        if (result) {
          toast.success('Date-specific availability updated successfully')
        }
      } else {
        const token = localStorage.getItem('access_token')
        const schedule = schedules?.data[0]
        if (!schedule) return

        const updatedAvailability = [...schedule.availability]
        const selectedDayIndex = updatedAvailability.findIndex(avail => 
          avail.days.some(d => d.toLowerCase() === selectedDay?.toLowerCase())
        )

        while (selectedDayIndex !== -1) {
          updatedAvailability.splice(selectedDayIndex, 1)
          const nextIndex = updatedAvailability.findIndex(avail => 
            avail.days.some(d => d.toLowerCase() === selectedDay?.toLowerCase())
          )
          if (nextIndex === -1) break
        }

        editingSchedule.slots.forEach(slot => {
          updatedAvailability.push({
            days: [selectedDay!],
            startTime: slot.startTime,
            endTime: slot.endTime
          })
        })

        const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/agents/${agentId}/schedules/${schedule.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...schedule,
            availability: updatedAvailability
          })
        })

        if (!response.ok) throw new Error('Failed to update schedule')
        await fetchSchedules()
        toast.success('Schedule updated successfully')
      }
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Failed to update schedule', error)
      toast.error('Failed to update schedule')
    }
  }

  const handleDeleteDateAvailability = async () => {
    if (selectedDate) {
      const result = await deleteDateAvailability(selectedDate)
      if (result) {
        toast.success('Date-specific availability deleted successfully')
        setIsEditModalOpen(false)
      }
    }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)



  const formatBookingTime = (startTime: string) => {
    const date = new Date(startTime)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {shortDays.map(day => (
            <div key={day} className="text-center font-medium text-gray-500 py-2 flex items-center justify-center gap-2">
              {day}
              <PermissionWrapper componentName="CreateSchedule">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleEditDay(getFullDayName(day))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </Button>
              </PermissionWrapper>
            </div>
          ))}

          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-32" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayName = days[date.getDay()]
            const availabilityTimes = getAvailabilityForDay(dayName)
            const dayBookings = getBookingsForDate(date)

            return (
              <div
                key={day}
                className={`h-32 p-2 border rounded hover:border-blue-300 ${
                  availabilityTimes.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium">{day}</div>
                  <div className="flex gap-1">
                    <PermissionWrapper componentName="CreateSchedule">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditDay(dayName, date)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
                    </PermissionWrapper>
                  </div>
                </div>
                
                <div className="space-y-1 mt-1">
                  {dayBookings.map((booking, i) => (
                    <div 
                      key={i} 
                      className="text-xs bg-blue-50 p-1 rounded"
                      title={`${booking.title}\nAttendee: ${booking.attendees[0]?.name}`}
                    >
                      <div className="font-medium text-blue-700">
                        {formatBookingTime(booking.startTime)}
                      </div>
                      <div className="truncate text-blue-600">
                        {booking.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? `Edit ${selectedDate} Schedule` : `Edit ${selectedDay} Schedule`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {editingSchedule.slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                />
                <span>-</span>
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                />
                {editingSchedule.slots.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimeSlot(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addTimeSlot}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>

            <div className="flex justify-end gap-2 mt-4">
              {selectedDate && (
                <Button variant="destructive" onClick={handleDeleteDateAvailability}>
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSchedule}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 