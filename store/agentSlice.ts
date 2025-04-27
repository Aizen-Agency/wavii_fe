// app/store/agentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import axiosInstance from '@/utils/axios';

interface UserRole {
  created_at: string;
  updated_at: string;
  role_id: number;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  prompt?: string | null;
  parent_username?: string | null;
  is_subaccount?: boolean | null;
  stripe_customer_id?: string | null;
  logo_url?: string | null;
  color_scheme?: string | null;
  login_heading?: string | null;
  login_subheading?: string | null;
  available_credits: number;
  company_name: string;
  retell_key: string;
  user_roles: UserRole;
  Agents?: Agent[];
}

export interface Agent {
  id: number;
  user_id: number;
  name: string;
  agent_type: string;
  main_goal: string;
  language: string;
  voice: string;
  personality: string;
  website: string;
  prompt: string;
  initial_message: string;
  inbound_enabled: boolean;
  google_calendar_id: string;
  total_call_duration: number;
  total_calls: number;
  accent: string;
  cal_key: string;
  twilio_sid: string;
  twilio_auth: string;
  retell_agent_id: string;
  retell_llm_id: string;
  created_at: string;
  agent_kb_ids: string[];
  cal_event_id: number;
  outbound_phone?: number;
  success_rate?: string;
  User?: User;
}

interface ErrorResponse {
  error: string;
}

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface IntegrateCalendarParams {
  agent_id: number;
  cal_api_key: string;
  event_type_id: number;
}

const handle403Error = (error: AxiosError<ErrorResponse>) => {
  if (error.response?.status === 403) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login'; // Redirect to login page
  }
};

export const createAgent = createAsyncThunk(
  'agent/createAgent',
  async (agentData: any, { rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      delete agentData.id;
      agentData.retell_key = user.retell_key;
      const response = await axiosInstance.post('/agents', agentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || { error: 'Unknown error' });
    }
  }
);

export const fetchAgents = createAsyncThunk(
  'agent/fetchAgents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/agents');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 403) {
        return rejectWithValue({ error: 'You do not have permission to view agents' });
      }
      return rejectWithValue(axiosError.response?.data || { error: 'Failed to fetch agents' });
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'agent/deleteAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/agents/${id}`);
      return id;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || { error: 'Unknown error' });
    }
  }
);

export const updateAgent = createAsyncThunk(
  'agent/updateAgent',
  async (agentData: Agent, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/agents/${agentData.id}`, agentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || { error: 'Unknown error' });
    }
  }
);

export const fetchAgentById = createAsyncThunk(
  'agent/fetchAgentById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agents/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || { error: 'Unknown error' });
    }
  }
);

// Thunk to integrate calendar
export const integrateCalendar = createAsyncThunk(
  'agent/integrateCalendar',
  async ({ agent_id, cal_api_key, event_type_id }: IntegrateCalendarParams, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agent_id}/integrate-calendar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cal_api_key,
          event_type_id,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login'; // Redirect to login page
        }
        throw new Error('Failed to integrate calendar');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const err = error as Error;
      return rejectWithValue(err.message);
    }
  }
);

const initialState: AgentState = {
  agents: [],
  selectedAgent: null,
  status: 'idle',
  error: null,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setSelectedAgent: (state, action) => {
      state.selectedAgent = action.payload;
    },
    updateSelectedAgent: (state, action) => {
      if (state.selectedAgent && state.selectedAgent.id === action.payload.id) {
        state.selectedAgent = { ...state.selectedAgent, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAgent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.agents = [...state.agents, action.payload as Agent];
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchAgents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.agents = action.payload as Agent[];
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.agents = state.agents.filter(agent => agent.id !== action.payload);
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.agents.findIndex(agent => agent.id === action.payload.id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchAgentById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedAgent = action.payload as Agent;
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAgent, updateSelectedAgent } = agentSlice.actions;
export default agentSlice.reducer;