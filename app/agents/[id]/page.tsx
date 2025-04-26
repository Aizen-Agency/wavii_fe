import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileEdit, Headphones, Layers, MessageSquare, Mic, Phone, Database } from "lucide-react"
import Link from "next/link"

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // This would normally come from an API or database
  const agentData = {
    id: params.id,
    name: params.id === "1" ? "Sarah Johnson" : params.id === "2" ? "Michael Chen" : "Alex Rodriguez",
    team: params.id === "1" || params.id === "3" ? "Sales Team" : "Support Team",
    metrics: {
      totalCalls: params.id === "1" ? 423 : params.id === "2" ? 387 : 356,
      meetingsBooked: params.id === "1" ? 32 : params.id === "2" ? 28 : 24,
      unresponsiveCalls: params.id === "1" ? 18 : params.id === "2" ? 15 : 22,
      avgCostPerMinute: params.id === "1" ? "$0.12" : params.id === "2" ? "$0.14" : "$0.11",
    },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{agentData.name}</h1>
            <p className="text-muted-foreground">{agentData.team}</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total calls</CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentData.metrics.totalCalls}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meetings Booked</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentData.metrics.meetingsBooked}</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unresponsive calls</CardTitle>
              <Phone className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentData.metrics.unresponsiveCalls}</div>
              <p className="text-xs text-muted-foreground">-3% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg cost per minute</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentData.metrics.avgCostPerMinute}</div>
              <p className="text-xs text-muted-foreground">-2% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Agent Section */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick test the agent</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="relative w-40 h-40 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
                <div className="absolute inset-0.5 rounded-full bg-white"></div>
                <div
                  className="absolute inset-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ background: "linear-gradient(to right, #8b5cf6, #ec4899)" }}
                ></div>
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <Mic className="h-10 w-10 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Test Your Agent</h3>
              <p className="text-center text-muted-foreground">
                Click the microphone to start a conversation with your AI agent.
              </p>
            </CardContent>
          </Card>

          {/* Agent Actions Section */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Outbound</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Prompt
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Phone className="mr-2 h-4 w-4" />
                Single Calling
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Layers className="mr-2 h-4 w-4" />
                Bulk Calling
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <MessageSquare className="mr-2 h-4 w-4" />
                Call Logs
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Headphones className="mr-2 h-4 w-4" />
                Edit voice
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Database className="mr-2 h-4 w-4" />
                Edit Knowledge Base
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
