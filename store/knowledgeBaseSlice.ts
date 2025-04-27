// knowledgeBaseSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '@/utils/axios';


interface KnowledgeBase {
  knowledge_base_id: number;
  knowledge_base_sources: {
    filename: string;
    file_url: string;
  }[];
}
// Define the initial state of the knowledge base
const initialState = {
  knowledgeBases: [],
  status: 'idle',
  error: null as string | null,
};

const handle403Error = (error: any) => {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login'; // Redirect to login page
  }
};

// Create an async thunk for fetching knowledge bases
export const fetchKnowledgeBases = createAsyncThunk(
  'knowledgeBase/fetchKnowledgeBases',
  async (agentId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agents/${agentId}/knowledge-bases`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Unknown error');
    }
  }
);

export const uploadFilesThunk = createAsyncThunk(
  'knowledgeBase/uploadFiles',
  async ({ agentId, files }: { agentId: number; files: File[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post(
        `/agents/${agentId}/upload-files-create-kbs`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Unknown error');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create an async thunk for deleting a knowledge base
export const deleteKnowledgeBaseThunk = createAsyncThunk(
  'knowledgeBase/deleteKnowledgeBase',
  async (knowledgeBaseId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/delete-knowledge-base/${knowledgeBaseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return knowledgeBaseId; // Return the ID of the deleted knowledge base
    } catch (error) {
      handle403Error(error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Unknown error');
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
      })
      .addCase(deleteKnowledgeBaseThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteKnowledgeBaseThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.knowledgeBases = state.knowledgeBases.filter(
          (kb: KnowledgeBase) => kb.knowledge_base_id !== action.payload
        );
      })
      .addCase(deleteKnowledgeBaseThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default knowledgeBaseSlice.reducer;