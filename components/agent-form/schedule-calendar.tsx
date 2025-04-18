import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, X, ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function ScheduleCalendar({ agentId }: ScheduleCalendarProps) {
  const [schedules, setSchedules] = useState<ScheduleResponse | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule>({
    days: [],
    slots: [{ startTime: "09:00", endTime: "17:00" }]
  })

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch bookings')
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

  const handleEditDay = (dayName: string) => {
    setSelectedDay(dayName)
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
      const token = localStorage.getItem('access_token')
      const schedule = schedules?.data[0]
      if (!schedule) return

      // Keep existing schedules for other days
      const updatedAvailability = [...schedule.availability]

      // Find and remove any existing schedules for the selected day
      const selectedDayIndex = updatedAvailability.findIndex(avail => 
        avail.days.some(d => d.toLowerCase() === selectedDay?.toLowerCase())
      )

      // If found, remove all entries for this day
      while (selectedDayIndex !== -1) {
        updatedAvailability.splice(selectedDayIndex, 1)
        const nextIndex = updatedAvailability.findIndex(avail => 
          avail.days.some(d => d.toLowerCase() === selectedDay?.toLowerCase())
        )
        if (nextIndex === -1) break
      }

      // Add new time slots for the selected day
      editingSchedule.slots.forEach(slot => {
        updatedAvailability.push({
          days: [selectedDay!],
          startTime: slot.startTime,
          endTime: slot.endTime
        })
      })

      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/schedules/${schedule.id}`, {
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
      setIsEditModalOpen(false)
      toast.success('Schedule updated successfully')
    } catch (error) {
      console.error('Failed to update schedule', error)
      toast.error('Failed to update schedule')
    }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const time = new Date()
    time.setHours(parseInt(hours), parseInt(minutes))
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

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
            <div key={day} className="text-center font-medium text-gray-500 py-2">
              {day}
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
                    {availabilityTimes.length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                          <div className="text-xs font-medium mb-1">Available Times:</div>
                          {availabilityTimes.map((time, i) => {
                            const [start, end] = time.split(' - ')
                            return (
                              <div key={i} className="text-xs text-green-600 py-1">
                                {formatTime(start)} - {formatTime(end)}
                              </div>
                            )
                          })}
                        </PopoverContent>
                      </Popover>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditDay(dayName)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
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
            <DialogTitle>Edit {selectedDay} Schedule</DialogTitle>
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