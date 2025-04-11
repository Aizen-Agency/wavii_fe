import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await axios.post('http://localhost:8080/login', {
      email,
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
    email,
    password,
    company_name,
    available_credits,
    color_scheme,
    logo_url,
    login_heading,
    login_subheading
  }: {
    email: string;
    password: string;
    company_name: string;
    available_credits: number;
    color_scheme: string;
    logo_url?: string;
    login_heading: string;
    login_subheading: string;
  }) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.post('http://localhost:8080/subaccounts', 
      {
        email,
        password,
        company_name,
        available_credits,
        color_scheme,
        logo_url,
        login_heading,
        login_subheading
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
      username?: string;
      email?: string;
      company_name?: string;
      password?: string;
      available_credits?: number;
    }
  }) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.patch(
      `http://localhost:8080/subaccounts/${id}`,
      userData,
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
    error: null as string | null,
    subaccounts: [] as any[],
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
