"use client"

import { ArrowLeft, Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCallLogs } from '@/store/callLogSlice'; // Adjust the import path as necessary
import { AppDispatch, RootState } from '@/store/store';


interface CallAnalysis {
  call_summary: string;
  in_voicemail: boolean;
  user_sentiment: string;
  call_successful: boolean;
  custom_analysis_data: Record<string, unknown>;
}

interface CallCost {
  product_costs: {
    product: string;
    unitPrice: number;
    cost: number;
  }[];
  total_duration_seconds: number;
  total_duration_unit_price: number;
  total_one_time_price: number;
  combined_cost: number;
}

interface ProductCost {
  product: string;
  unitPrice: number;
  cost: number;
}



export default function CallLogsPage() {
  const router = useRouter()
  const { id: agentId } = useParams();  
  const dispatch = useDispatch<AppDispatch>() 
  const { logs, status } = useSelector((state: RootState) => state.callLogs)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string, content: JSX.Element } | null>(null);

  useEffect(() => {
      dispatch(fetchCallLogs({ agentId: Number(agentId) }))
  }, [dispatch, agentId])

  const handleLoadMore = () => {
    if (logs.length > 0) {
      const lastCallId = logs[logs.length - 1].call_id
      dispatch(fetchCallLogs({ agentId: Number(agentId), paginationKey: lastCallId }))
    }
  }

  const openModal = (title: string, content: JSX.Element) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalContent(null);
    setIsModalOpen(false);
  };

  const renderCallAnalysis = (analysis: CallAnalysis) => (
    <div>
      <p><strong>Call Summary:</strong> {analysis.call_summary}</p>
      <p><strong>In Voicemail:</strong> {analysis.in_voicemail ? 'Yes' : 'No'}</p>
      <p><strong>User Sentiment:</strong> {analysis.user_sentiment}</p>
      <p><strong>Call Successful:</strong> {analysis.call_successful ? 'Yes' : 'No'}</p>
      <p><strong>Custom Analysis Data:</strong> {JSON.stringify(analysis.custom_analysis_data, null, 2)}</p>
    </div>
  );

  const renderCallCost = (cost: CallCost) => (
    <div>
      <p><strong>Total Duration (seconds):</strong> {cost.total_duration_seconds}</p>
      <p><strong>Total Duration Unit Price:</strong> {cost.total_duration_unit_price}</p>
      <p><strong>Total One Time Price:</strong> {cost.total_one_time_price}</p>
      <p><strong>Combined Cost:</strong> {cost.combined_cost}</p>
      <div>
        <strong>Product Costs:</strong>
        <ul>
          {cost.product_costs.map((product: ProductCost, index: number) => (
            <li key={index}>
              {product.product}: {product.unitPrice} per unit, Total: {product.cost}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold">View Call Logs</h1>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Search logs..." className="max-w-md" />
          <Button className="bg-black hover:bg-black/90">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="border rounded-lg">
          <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50">
            <div className="font-medium col-span-2">Session ID</div>
            <div className="font-medium">Date</div>
            <div className="font-medium">Messages</div>
            <div className="font-medium">Transcript</div>
            <div className="font-medium">Call Analysis</div>
            <div className="font-medium">Call Cost</div>
            <div className="font-medium">Disconnection Reason</div>
          </div>

          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.call_id} className="grid grid-cols-7 gap-4 p-4">
                <div className="col-span-2">{log.call_id}</div>
                <div>
                  {new Date(log.start_timestamp).toLocaleDateString('en-GB')}<br />
                  {new Date(log.start_timestamp).toLocaleTimeString()}
                </div>
                <div>
                  <button onClick={() => openModal('Transcript', <p>{log.transcript}</p>)} className="text-blue-500 underline">
                    View Transcript
                  </button>
                </div>
                <div>
                  <button onClick={() => openModal('Call Analysis', renderCallAnalysis(log.call_analysis))} className="text-blue-500 underline">
                    View Analysis
                  </button>
                </div>
                <div>
                  <button onClick={() => openModal('Call Cost', renderCallCost(log.call_cost))} className="text-blue-500 underline">
                    View Cost
                  </button>
                </div>
                <div>{log.disconnection_reason}</div>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 text-center">No results found</div>
          )}
        </div>

        {status === 'loading' && <div className="text-center">Loading...</div>}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Showing {logs.length} results</div>
          <Button onClick={handleLoadMore} disabled={status === 'loading'} className="text-sm">
            Load More
          </Button>
        </div>
      </div>

      {isModalOpen && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{modalContent.title}</h2>
            <div className="mb-4">{modalContent.content}</div>
            <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

