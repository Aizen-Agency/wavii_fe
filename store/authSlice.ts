import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    const response = await axios.post('https://retell-demo-be-cfbda6d152df.herokuapp.com/login', {
      username,
      password,
    });
    return response.data.token; // Assuming the response contains the token
  }
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (token: string) => {
    const response = await axios.get('https://retell-demo-be-cfbda6d152df.herokuapp.com/user', {
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
    const response = await axios.post('https://retell-demo-be-cfbda6d152df.herokuapp.com/register', {
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
    const response = await axios.patch('https://retell-demo-be-cfbda6d152df.herokuapp.com/user', userData, {
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
      });
  },
});

export default authSlice.reducer;
