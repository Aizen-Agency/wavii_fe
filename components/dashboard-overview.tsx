import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Phone, Users, Clock } from "lucide-react"

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your call center operations and performance.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meetings Booked</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 new this month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Calls</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4m 32s</div>
                <p className="text-xs text-muted-foreground">-18s from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <BarChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">+3 from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1 bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Subaccounts</CardTitle>
                <CardDescription>Call volume and success rate over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center border-t p-6">
                <div className="text-muted-foreground">This would display all the sub accounts</div>
              </CardContent>
            </Card>

            <Card className="col-span-1 bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaigns</CardTitle>
                    <CardDescription>Your active and recent campaigns</CardDescription>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">7</div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] flex flex-col gap-2 border-t p-6">
                <div className="flex items-center justify-between py-2">
                  <div className="font-medium">Q2 Outreach</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="font-medium">Customer Feedback</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="font-medium">New Product Launch</div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="font-medium">Follow-up Calls</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Create and manage your call campaigns</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground">Campaign Management Content</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
