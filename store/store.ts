// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Adjust the path if necessary
import agentReducer from './agentSlice';
import voiceReducer from './voiceSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    agent: agentReducer,
    voice: voiceReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export default store;