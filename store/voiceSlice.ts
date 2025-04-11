import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

interface Voice {
  voice_id: string;
  voice_name: string;
  provider: string;
  accent: string;
  gender: string;
  age: string;
  avatar_url: string;
  preview_audio_url: string;
}

interface VoiceState {
  voices: Voice[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: VoiceState = {
  voices: [],
  status: 'idle',
  error: null,
};

const handle403Error = (error: AxiosError) => {
  if (error.response?.status === 403) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login'; // Redirect to login page
  }
};

export const fetchVoices = createAsyncThunk(
  'voice/fetchVoices',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8080/list-voices', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      handle403Error(axiosError);
      return rejectWithValue(axiosError.response?.data || { error: 'Unknown error' });
    }
  }
);

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVoices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVoices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.voices = action.payload;
      })
      .addCase(fetchVoices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default voiceSlice.reducer;