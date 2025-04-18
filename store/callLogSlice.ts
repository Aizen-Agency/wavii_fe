import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import axiosInstance from '@/utils/axios';

interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
  num: number;
  values: number[];
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

interface CallAnalysis {
  call_summary: string;
  in_voicemail: boolean;
  user_sentiment: string;
  call_successful: boolean;
  custom_analysis_data: Record<string, unknown>;
}

interface CallLog {
  call_type: string;
  access_token: string;
  call_id: string;
  agent_id: string;
  call_status: string;
  metadata: Record<string, unknown>;
  retell_llm_dynamic_variables: Record<string, string>;
  opt_out_sensitive_data_storage: boolean;
  start_timestamp: number;
  end_timestamp: number;
  transcript: string;
  transcript_object: {
    role: string;
    content: string;
    words: {
      word: string;
      start: number;
      end: number;
    }[];
  }[];
  transcript_with_tool_calls: {
    role: string;
    content: string;
    words: {
      word: string;
      start: number;
      end: number;
    }[];
  }[];
  recording_url: string;
  public_log_url: string;
  latency: {
    e2e: LatencyMetrics;
    llm: LatencyMetrics;
    llm_websocket_network_rtt: LatencyMetrics;
    tts: LatencyMetrics;
    knowledge_base: LatencyMetrics;
    s2s: LatencyMetrics;
  };
  disconnection_reason: string;
  call_analysis: CallAnalysis;
  call_cost: CallCost;
}

interface CallLogState {
  logs: CallLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CallLogState = {
  logs: [],
  status: 'idle',
  error: null,
};

const handle403Error = (error: Response) => {
  if (error.status === 403) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login'; // Redirect to login page
  }
};

export const fetchCallLogs = createAsyncThunk(
  'callLogs/fetchCallLogs',
  async ({ agentId, paginationKey, searchQuery }: { agentId: number; paginationKey?: string; searchQuery?: string }, { getState, rejectWithValue }) => {
    const url = new URL(`/agents/${agentId}/call-logs`);
    url.searchParams.append('limit', '50');
    if (paginationKey) {
      url.searchParams.append('pagination_key', paginationKey);
    }
    if (searchQuery) {
      url.searchParams.append('to_number', searchQuery);
    }
    
    try {
      const response = await axiosInstance.get(url.toString());
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch call logs');
    }
  }
);

const callLogSlice = createSlice({
  name: 'callLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCallLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.meta.arg.searchQuery || !action.meta.arg.paginationKey) {
          state.logs = action.payload;
        } else {
          state.logs = [...state.logs, ...action.payload];
        }
      })
      .addCase(fetchCallLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch call logs';
      });
  },
});

export default callLogSlice.reducer;