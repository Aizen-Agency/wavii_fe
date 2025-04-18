"use client"

import { ArrowLeft, Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useMemo } from 'react';
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

// interface CallLog {
//   call_id: string;
//   start_timestamp: string;
//   transcript: string;
//   call_analysis: CallAnalysis;
//   call_cost: CallCost;
//   disconnection_reason: string;
//   recording_url: string;
// }



export default function CallLogsPage() {
  const router = useRouter()
  const { id: agentId } = useParams();  
  const dispatch = useDispatch<AppDispatch>() 
  const { logs, status } = useSelector((state: RootState) => state.callLogs)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string, content: JSX.Element } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchCallLogs({ agentId: Number(agentId) }))
  }, [dispatch, agentId])

  const handleLoadMore = () => {
    if (logs.length > 0) {
      const lastCallId = logs[logs.length - 1].call_id
      dispatch(fetchCallLogs({ agentId: Number(agentId), paginationKey: lastCallId }))
    }
  }

  // Filter out duplicate call logs
  const uniqueLogs = useMemo(() => {
    const unique = new Map();
    logs.forEach(log => {
      if (!unique.has(log.call_id)) {
        unique.set(log.call_id, log);
      }
    });
    return Array.from(unique.values());
  }, [logs]);

  // Debug logging
  useEffect(() => {
    console.log('Logs:', logs);
    console.log('Unique Logs:', uniqueLogs);
    console.log('Status:', status);
  }, [logs, uniqueLogs, status]);

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

  const renderTranscript = (transcript: string) => {
    // Split transcript into messages
    const messages = transcript.split('\n').filter(msg => msg.trim());
    
    return (
      <div className="space-y-4">
        {messages.map((message, index) => {
          // Check if message starts with "Agent:" or "User:"
          const isAgent = message.startsWith('Agent:');
          // const isUser = message.startsWith('User:');
          
          // Extract the actual message content
          const content = message.replace(/^(Agent:|User:)\s*/, '');
          
          return (
            <div 
              key={index} 
              className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  isAgent 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'bg-green-100 text-green-900'
                }`}
              >
                <div className="font-semibold mb-1">
                  {isAgent ? 'Agent' : 'User'}
                </div>
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAudioPlayer = (recordingUrl: string) => {
    if (!recordingUrl) {
      return <div className="text-gray-500">No recording available</div>;
    }

    return (
      <div className="flex items-center gap-2">
        <audio controls className="h-8">
          <source src={recordingUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  };

  const truncateCallId = (callId: string) => {
    if (callId.length <= 15) return callId;
    return `${callId.slice(0, 7)}...${callId.slice(-7)}`;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      dispatch(fetchCallLogs({ agentId: Number(agentId) }));
      return;
    }

    setIsSearching(true);
    try {
      dispatch(fetchCallLogs({ 
        agentId: Number(agentId), 
        searchQuery: searchQuery 
      }));
    } catch (error) {
      console.error('Error searching call logs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
          <Input 
            placeholder="Search by phone number..." 
            className="max-w-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            className="bg-black hover:bg-black/90 text-sm"
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          {searchQuery && (
            <Button 
              className="bg-gray-500 hover:bg-gray-600 text-sm"
              onClick={() => {
                setSearchQuery('');
                dispatch(fetchCallLogs({ agentId: Number(agentId) }));
              }}
            >
              View All
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <div className="grid grid-cols-9 gap-4 p-4 border-b bg-gray-50 text-sm">
            <div className="font-medium col-span-2">Session ID</div>
            <div className="font-medium">Date</div>
            <div className="font-medium">To Number</div>
            <div className="font-medium">Recording</div>
            <div className="font-medium">Transcript</div>
            <div className="font-medium">Call Analysis</div>
            <div className="font-medium">Call Cost</div>
            <div className="font-medium">Disconnection Reason</div>
          </div>

          {status === 'loading' ? (
            <div className="p-4 text-center text-sm">Loading...</div>
          ) : uniqueLogs.length > 0 ? (
            uniqueLogs.map((log) => (
              <div key={log.call_id} className="grid grid-cols-9 gap-4 p-4 text-sm">
                <div className="col-span-2">
                  <div 
                    className="truncate cursor-help" 
                    title={log.call_id}
                  >
                    {truncateCallId(log.call_id)}
                  </div>
                </div>
                <div>
                  {new Date(log.start_timestamp).toLocaleDateString('en-GB')}<br />
                  {new Date(log.start_timestamp).toLocaleTimeString()}
                </div>
                <div>
                  {log.call_type === 'phone_call' ? log.to_number || 'Unknown number' : 'Web call'}
                </div>
                <div>
                  {renderAudioPlayer(log.recording_url)}
                </div>
                <div>
                  <button 
                    onClick={() => openModal('Transcript', renderTranscript(log.transcript))} 
                    className="text-blue-500 underline"
                  >
                    View Transcript
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => openModal('Call Analysis', renderCallAnalysis(log.call_analysis))} 
                    className="text-blue-500 underline"
                  >
                    View Analysis
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => openModal('Call Cost', renderCallCost(log.call_cost))} 
                    className="text-blue-500 underline"
                  >
                    View Cost
                  </button>
                </div>
                <div>{log.disconnection_reason}</div>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 text-center">
              {logs.length === 0 ? "No results found" : "No unique results found"}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {uniqueLogs.length} of {logs.length} results
          </div>
          <Button onClick={handleLoadMore} disabled={status === 'loading'} className="text-sm">
            Load More
          </Button>
        </div>
      </div>

      {isModalOpen && modalContent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{modalContent.title}</h2>
            <div className="mb-4">{modalContent.content}</div>
            <button 
              onClick={closeModal} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

