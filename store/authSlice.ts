import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
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
  roles?: Role[];
  Agents?: Agent[];
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Agent {
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

interface SubAccount {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  Users: User[];
  success_rate: string;
  total_call_cost: string;
  total_agents: number;
  total_bookings: number;
  successful_bookings: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  subaccounts: SubAccount[];
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8080/login', {
        email,
        password,
      });
      return response.data.token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || { error: 'Login failed' });
      }
      return rejectWithValue({ error: 'An unexpected error occurred' });
    }
  }
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || { error: 'Failed to fetch user data' });
      }
      return rejectWithValue({ error: 'An unexpected error occurred' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, password, email, company_name }: { username: string; password: string; email: string; company_name: string }) => {
    const response = await axios.post('http://localhost:8080/register', {
      username,
      password,
      email,
      company_name,
    });
    return response.data; // Adjust based on the actual response schema
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ userData }: {  userData: any }) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.patch('http://localhost:8080/user', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const updatedData = response.data;
    const storedData = JSON.parse(localStorage.getItem("userData") || "{}");

    // Store only updated keys
    const changedData = Object.keys(updatedData).reduce((acc, key) => {
      if (updatedData[key] !== storedData[key]) {
        acc[key] = updatedData[key];
      }
      return acc;
    }, {} as Record<string, any>);

    localStorage.setItem("userData", JSON.stringify({ ...storedData, ...changedData }));
    return response.data; // Assuming the response contains updated user data
  }
);

export const uploadLogo = createAsyncThunk(
  'auth/uploadLogo',
  async (file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post('http://localhost:8080/upload-logo', 
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
);

export const createSubAccount = createAsyncThunk(
  'auth/createSubAccount',
  async ({
    name,
    description,
  }: {
    name: string;
    description: string;
  }) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.post('http://localhost:8080/subaccounts', 
      {
        name, 
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
);

export const fetchSubAccounts = createAsyncThunk(
  'auth/fetchSubAccounts',
  async () => {
    const token = localStorage.getItem('access_token');
    const response = await axios.get('http://localhost:8080/subaccounts', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }
);

export const updateSubAccount = createAsyncThunk(
  'auth/updateSubAccount',
  async ({ id, userData }: { 
    id: number, 
    userData: {
      company_name?: string;
      description?: string;
    }
  }) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.patch(
      `http://localhost:8080/subaccounts/${id}`,
      {
        name: userData.company_name, // Map company_name to name for API
        description: userData.description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Transform the response back to our frontend format
    return {
      id: response.data.id,
      name: response.data.name,
      description: response.data.description,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      Users: response.data.Users || [],
      success_rate: response.data.success_rate || "",
      total_call_cost: response.data.total_call_cost || "",
      total_agents: response.data.total_agents || 0,
      total_bookings: response.data.total_bookings || 0,
      successful_bookings: response.data.successful_bookings || 0,
    };
  }
);

export const deleteSubAccount = createAsyncThunk(
  'auth/deleteSubAccount',
  async (id: number) => {
    const token = localStorage.getItem('access_token');
    await axios.delete(`http://localhost:8080/subaccounts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id; // Return the id to remove it from the state
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    status: 'idle',
    error: null,
    subaccounts: [] as SubAccount[],
  } as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle successful registration, e.g., store user data or token
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload; // Update the user data in the store
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(uploadLogo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle successful logo upload
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(createSubAccount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createSubAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subaccounts = [...state.subaccounts, action.payload];
      })
      .addCase(createSubAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(fetchSubAccounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSubAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subaccounts = action.payload;
      })
      .addCase(fetchSubAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateSubAccount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSubAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subaccounts = state.subaccounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        );
      })
      .addCase(updateSubAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(deleteSubAccount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteSubAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subaccounts = state.subaccounts.filter(
          account => account.id !== action.payload
        );
      })
      .addCase(deleteSubAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default authSlice.reducer;
