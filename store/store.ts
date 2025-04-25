// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Adjust the path if necessary
import agentReducer from './agentSlice';
import voiceReducer from './voiceSlice';
import knowledgeBaseReducer from './knowledgeBaseSlice';
import callLogReducer from './callLogSlice';
import phoneNumberReducer from './phoneNumberSlice';
import twilioReducer from './twilioSlice';
import rbacReducer from './rbacSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    agent: agentReducer,
    voice: voiceReducer,
    knowledgeBase: knowledgeBaseReducer,
    callLogs: callLogReducer,
    phoneNumbers: phoneNumberReducer,
    twilio: twilioReducer,
    rbac: rbacReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;