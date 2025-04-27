import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';

export const fetchDashboardMetrics = createAsyncThunk(
  'metrics/fetchDashboardMetrics',
  async (agentId) => {
    try {
      const response = await axiosInstance.get(`/agents/${agentId}/dashboard-metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
);

const initialState = {
  metrics: {
    total_calls: { value: 0, change: 0 },
    meetings_booked: { value: 0, change: 0 },
    unresponsive_calls: { value: 0, change: 0 },
    avg_cost_per_minute: { value: 0, change: 0 }
  },
  loading: false,
  error: null
};

const metricSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default metricSlice.reducer; 