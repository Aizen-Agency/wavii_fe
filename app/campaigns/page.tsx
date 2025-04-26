import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your call campaigns</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/campaigns/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>View and manage your currently active call campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Calls Made</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Q2 Outreach</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>Apr 1, 2025</TableCell>
                  <TableCell>Jun 30, 2025</TableCell>
                  <TableCell>248</TableCell>
                  <TableCell>78%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Customer Feedback</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>Mar 15, 2025</TableCell>
                  <TableCell>May 15, 2025</TableCell>
                  <TableCell>187</TableCell>
                  <TableCell>82%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">New Product Launch</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Scheduled
                    </span>
                  </TableCell>
                  <TableCell>May 1, 2025</TableCell>
                  <TableCell>Jul 31, 2025</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Follow-up Calls</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>Apr 10, 2025</TableCell>
                  <TableCell>Ongoing</TableCell>
                  <TableCell>312</TableCell>
                  <TableCell>65%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Past Campaigns</CardTitle>
            <CardDescription>Review your completed call campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Calls Made</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Q1 Outreach</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Completed
                    </span>
                  </TableCell>
                  <TableCell>Jan 1, 2025</TableCell>
                  <TableCell>Mar 31, 2025</TableCell>
                  <TableCell>856</TableCell>
                  <TableCell>72%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Holiday Promotion</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Completed
                    </span>
                  </TableCell>
                  <TableCell>Dec 1, 2024</TableCell>
                  <TableCell>Dec 31, 2024</TableCell>
                  <TableCell>423</TableCell>
                  <TableCell>85%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
