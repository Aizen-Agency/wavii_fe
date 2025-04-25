"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Calendar, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/utils/axios"
import { toast } from "react-toastify"
import LoadingOverlay from "@/components/loadingOverlay"
import PermissionWrapper from '@/components/PermissionWrapper'

interface AgentStats {
  total_calls: number;
  cost_breakdown: {
    products: {
      [key: string]: {
        total_cost: number;
        cost_per_minute: number;
        total_duration_seconds: number;
        unit_price: number;
      };
    };
    total_duration_seconds: number;
    total_cost: number;
  };
  unresponsive_calls: number;
  answered_calls: number;
  meetings_booked: number;
}

export default function AgentDashboard() {
  const { id: agentId } = useParams();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchStats = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await axiosInstance.get(`/agents/${agentId}/stats?${params.toString()}`);
      setStats(response.data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("An unknown error occurred");
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(dateRange.startDate, dateRange.endDate);
  }, [agentId, dateRange]);

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/agent/${agentId}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back</span>
            </Link>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          </div>
        </div>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/agent/${agentId}`} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-40"
            />
            <span>to</span>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-40"
            />
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
              const today = new Date().toISOString().split('T')[0];
              setDateRange({
                startDate: thirtyDaysAgo,
                endDate: today
              });
            }}
          >
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Calls Card */}
        <PermissionWrapper componentName="DashboardStats">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <h2 className="text-3xl font-bold mt-1">{stats?.total_calls || 0}</h2>
              </div>
              <div className="p-2 rounded-full bg-gray-100">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </Card>
        </PermissionWrapper>

        {/* Answered Calls Card */}
        <PermissionWrapper componentName="DashboardStats">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Answered Calls</p>
                <h2 className="text-3xl font-bold mt-1">{stats?.answered_calls || 0}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.total_calls ? Math.round((stats.answered_calls / stats.total_calls) * 100) : 0}% success rate
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>
        </PermissionWrapper>

        {/* Unresponsive Calls Card */}
        <PermissionWrapper componentName="DashboardStats">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresponsive Calls</p>
                <h2 className="text-3xl font-bold mt-1">{stats?.unresponsive_calls || 0}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.total_calls ? Math.round((stats.unresponsive_calls / stats.total_calls) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </Card>
        </PermissionWrapper>

        {/* Meetings Booked Card */}
        <PermissionWrapper componentName="DashboardStats">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Meetings Booked</p>
                <h2 className="text-3xl font-bold mt-1">{stats?.meetings_booked || 0}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.answered_calls ? Math.round((stats.meetings_booked / stats.answered_calls) * 100) : 0}% conversion
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>
        </PermissionWrapper>
      </div>

      {/* Cost Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <PermissionWrapper componentName="DashboardCostBreakdown">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            <div className="space-y-4">
              {stats?.cost_breakdown.products && Object.entries(stats.cost_breakdown.products).map(([product, details]) => (
                <div key={product} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product}</span>
                    <span className="text-lg font-bold">${(details?.total_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <div>Duration: {Math.floor((details?.total_duration_seconds || 0) / 60)}m {(details?.total_duration_seconds || 0) % 60}s</div>
                    <div>Cost per minute: ${(details?.cost_per_minute || 0).toFixed(2)}</div>
                    <div>Unit price: ${(details?.unit_price || 0).toFixed(4)}/s</div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost</span>
                  <span className="text-lg font-bold">${(stats?.cost_breakdown?.total_cost || 0).toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Total Duration: {Math.floor((stats?.cost_breakdown?.total_duration_seconds || 0) / 60)}m {(stats?.cost_breakdown?.total_duration_seconds || 0) % 60}s
                </div>
              </div>
            </div>
          </Card>
        </PermissionWrapper>

        {/* Call Duration Distribution */}
        <PermissionWrapper componentName="DashboardCostBreakdown">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Call Duration Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>Average Duration</span>
                    <span>
                      {stats?.cost_breakdown.total_duration_seconds && stats.total_calls
                        ? `${Math.floor((stats.cost_breakdown.total_duration_seconds / stats.total_calls) / 60)}m ${Math.floor((stats.cost_breakdown.total_duration_seconds / stats.total_calls) % 60)}s`
                        : "0m 0s"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats?.cost_breakdown.total_duration_seconds || 0) / (stats?.total_calls || 1) / 60,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PermissionWrapper>
      </div>
    </div>
  );
} 