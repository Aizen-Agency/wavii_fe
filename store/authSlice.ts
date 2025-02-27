import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    const response = await axios.post('http://localhost:8080/login', {
      username,
      password,
    });
    return response.data.token; // Assuming the response contains the token
  }
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (token: string) => {
    const response = await axios.get('http://localhost:8080/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Assuming the response contains user data
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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    status: 'idle',
    error: null as string | null,
  },
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
      });
  },
});

export default authSlice.reducer;
