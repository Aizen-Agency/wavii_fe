// knowledgeBaseSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the initial state of the knowledge base
const initialState = {
  knowledgeBases: [],
  status: 'idle',
  error: null as string | null,
};

// Create an async thunk for fetching knowledge bases
export const fetchKnowledgeBases = createAsyncThunk(
  'knowledgeBase/fetchKnowledgeBases',
  async (agentId: number, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('access_token');
      const response = await axios.get(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/knowledge-bases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const uploadFilesThunk = createAsyncThunk(
  'knowledgeBase/uploadFiles',
  async ({ agentId, files }: { agentId: number; files: File[] }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('access_token');
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `https://retell-demo-be-cfbda6d152df.herokuapp.com/agents/${agentId}/upload-files-create-kbs`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create the knowledge base slice
const knowledgeBaseSlice = createSlice({
  name: 'knowledgeBase',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeBases.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchKnowledgeBases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.knowledgeBases = action.payload;
      })
      .addCase(fetchKnowledgeBases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default knowledgeBaseSlice.reducer;