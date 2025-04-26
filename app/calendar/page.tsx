import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ChevronLeft, Clock, User } from "lucide-react"

export default function CalendarPage() {
  // Sample meeting data
  const meetings = [
    { id: 1, title: "Sales Call with Acme Corp", date: "Apr 3, 2025", time: "9:00 AM", attendee: "John Smith" },
    { id: 2, title: "Team Meeting", date: "Apr 8, 2025", time: "2:00 PM", attendee: "All Team Members" },
    { id: 3, title: "Client Call", date: "Apr 12, 2025", time: "11:00 AM", attendee: "Sarah Johnson" },
    { id: 4, title: "Product Demo", date: "Apr 15, 2025", time: "10:30 AM", attendee: "Michael Chen" },
    { id: 5, title: "Follow-up Call", date: "Apr 18, 2025", time: "3:15 PM", attendee: "David Wilson" },
    { id: 6, title: "Strategy Meeting", date: "Apr 22, 2025", time: "1:00 PM", attendee: "Leadership Team" },
    { id: 7, title: "Sales Pitch", date: "Apr 25, 2025", time: "11:30 AM", attendee: "Potential Client" },
    { id: 8, title: "Quarterly Review", date: "Apr 29, 2025", time: "9:00 AM", attendee: "Department Heads" },
  ]

  // Generate calendar days
  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  // Find meetings for specific days
  const getMeetingsForDay = (day: number) => {
    return meetings.filter((meeting) => {
      const meetingDay = Number.parseInt(meeting.date.split(", ")[0].split(" ")[1])
      return meetingDay === day
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar Settings</h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Section */}
          <Card className="bg-white border-0 shadow-sm flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>April 2025</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Calendar header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium py-2 text-sm">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before the 1st */}
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24 border rounded-md p-1 bg-gray-50"></div>
                ))}

                {/* Calendar days */}
                {days.map((day) => {
                  const dayMeetings = getMeetingsForDay(day)
                  return (
                    <div key={day} className="h-24 border rounded-md p-1 relative">
                      <div className="text-sm font-medium">{day}</div>
                      <div className="mt-1 space-y-1 overflow-hidden max-h-[80%]">
                        {dayMeetings.map((meeting) => (
                          <div key={meeting.id} className="text-xs bg-purple-100 text-purple-800 p-1 rounded truncate">
                            {meeting.time} - {meeting.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Meetings List Section */}
          <Card className="bg-white border-0 shadow-sm w-full lg:w-80">
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings
                  .sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`)
                    const dateB = new Date(`${b.date} ${b.time}`)
                    return dateA.getTime() - dateB.getTime()
                  })
                  .map((meeting) => (
                    <div key={meeting.id} className="border-b pb-3 last:border-0">
                      <div className="font-medium">{meeting.title}</div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {meeting.date} at {meeting.time}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <User className="h-3 w-3 mr-1" />
                        {meeting.attendee}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
