import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';

// Define types
interface TwilioAccount {
  id: number;
  account_sid: string;
  auth_token: string;
  friendly_name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}


export interface TrunkInfo {
  sid: string;
  domainName: string;
  friendlyName: string;
}

interface TwilioState {
  accounts: TwilioAccount[];
  selectedAccountId: number | null;
  availableNumbers: any[];
  activeNumbers: any[];
  trunks: TrunkInfo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface AvailableNumber {
  id: number;
  phoneNumber: string;
  sid: string;
  friendlyName: string;
}

// Thunk to fetch all Twilio accounts
export const fetchTwilioAccounts = createAsyncThunk(
  'twilio/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get('/twilio-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to add a new Twilio account
export const addTwilioAccount = createAsyncThunk(
  'twilio/addAccount',
  async (accountData: { account_sid: string; auth_token: string; friendly_name: string; is_default: boolean }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.post('/twilio-accounts', accountData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to update a Twilio account
export const updateTwilioAccount = createAsyncThunk(
  'twilio/updateAccount',
  async (accountData: { id: number; friendly_name?: string; is_default?: boolean }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.patch(`/twilio-accounts/${accountData.id}`, accountData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to delete a Twilio account
export const deleteTwilioAccount = createAsyncThunk(
  'twilio/deleteAccount',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      await axiosInstance.delete(`/twilio-accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return accountId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to fetch available phone numbers
export const fetchAvailableNumbers = createAsyncThunk(
  'twilio/fetchAvailableNumbers',
  async ({ country, accountId }: { country: string; accountId: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`/available-numbers?country=${country}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to fetch active phone numbers
export const fetchActiveNumbers = createAsyncThunk(
  'twilio/fetchActiveNumbers',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`/active-numbers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Add helper function to generate unique domain name
const generateUniqueDomainName = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `retell${randomString}`;
};

// Modify createTrunk thunk
export const createTrunk = createAsyncThunk(
  'twilio/createTrunk',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const domainName = generateUniqueDomainName();
      const response = await axiosInstance.post('/create-trunk', {
        DomainName: domainName,
        FriendlyName: domainName,
        OriginationUrlName: 'sip:5t4n6j0wnrl.sip.livekit.cloud'
      }, {
        headers: {
          'twilio-account-id': accountId
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Add new thunk to handle automatic trunk creation
export const ensureTrunkExists = createAsyncThunk(
  'twilio/ensureTrunkExists',
  async (accountId: number, { dispatch, rejectWithValue }) => {
    try {
      // First fetch existing trunks
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get('/get-trunks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });

      // If no trunks exist, create one
      if (!response.data || response.data.length === 0) {
        return dispatch(createTrunk(accountId)).unwrap();
      }

      return response.data[0]; // Return the first trunk if exists
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to fetch trunks
export const fetchTrunks = createAsyncThunk(
  'twilio/fetchTrunks',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get('/get-trunks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Thunk to register phone number to trunk
export const registerPhoneToTrunk = createAsyncThunk(
  'twilio/registerPhoneToTrunk',
  async ({ 
    phoneSid, 
    terminationUri, 
    trunkSid, 
    accountId,
    phoneNumbertoadd
  }: { 
    phoneSid: string; 
    terminationUri: string; 
    trunkSid: string; 
    accountId: number;
    phoneNumbertoadd: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      // First ensure a trunk exists
      const trunkResult = await dispatch(ensureTrunkExists(accountId)).unwrap();
      
      // Always use the first trunk's SID
      const trunkToUse = trunkSid || trunkResult.sid;
      
      const response = await axiosInstance.post('/register-to-trunk', {
        phonesid: phoneSid === "" ? null : phoneSid,
        termination_uri: terminationUri,
        trunksid: trunkToUse,
        phoneNumberToAdd: phoneNumbertoadd
      }, {
        headers: {
          'twilio-account-id': accountId
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Add new thunk for activating numbers
export const activateNumber = createAsyncThunk(
  'twilio/activateNumber',
  async ({ 
    phoneNumber, 
    accountId 
  }: { 
    phoneNumber: string; 
    accountId: number 
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.post('/activate-number', {
        phone_number: phoneNumber,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Add new thunk for deactivating numbers
export const deactivateNumber = createAsyncThunk(
  'twilio/deactivateNumber',
  async ({ 
    phoneNumber, 
    accountId 
  }: { 
    phoneNumber: string; 
    accountId: number 
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.post('/deactivate-number', {
        phone_number: phoneNumber,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Add new thunk for purchasing numbers
export const purchaseNumber = createAsyncThunk(
  'twilio/purchaseNumber',
  async ({ 
    phoneNumber, 
    accountId 
  }: { 
    phoneNumber: string; 
    accountId: number 
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.post('/purchase-number', {
        phone_number: phoneNumber,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'twilio-account-id': accountId.toString()
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Initial state
const initialState: TwilioState = {
  accounts: [],
  selectedAccountId: null,
  availableNumbers: [],
  activeNumbers: [],
  trunks: [],
  status: 'idle',
  error: null,
};

// Create the slice
const twilioSlice = createSlice({
  name: 'twilio',
  initialState,
  reducers: {
    setSelectedAccount: (state, action) => {
      state.selectedAccountId = action.payload;
    },
    clearAvailableNumbers: (state) => {
      state.availableNumbers = [];
    },
    clearActiveNumbers: (state) => {
      state.activeNumbers = [];
    },
    clearTrunks: (state) => {
      state.trunks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchTwilioAccounts
      .addCase(fetchTwilioAccounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTwilioAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accounts = action.payload;
        // Set selected account to default account if none is selected
        if (!state.selectedAccountId && action.payload.length > 0) {
          const defaultAccount = action.payload.find((account: TwilioAccount) => account.is_default);
          state.selectedAccountId = defaultAccount ? defaultAccount.id : action.payload[0].id;
        }
      })
      .addCase(fetchTwilioAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Handle addTwilioAccount
      .addCase(addTwilioAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
        if (action.payload.is_default) {
          state.accounts = state.accounts.map(account => 
            account.id !== action.payload.id ? { ...account, is_default: false } : account
          );
        }
      })
      // Handle updateTwilioAccount
      .addCase(updateTwilioAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.map(account =>
          account.id === action.payload.id ? { ...account, ...action.payload } : account
        );
        if (action.payload.is_default) {
          state.accounts = state.accounts.map(account => 
            account.id !== action.payload.id ? { ...account, is_default: false } : account
          );
        }
      })
      // Handle deleteTwilioAccount
      .addCase(deleteTwilioAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
        if (state.selectedAccountId === action.payload) {
          state.selectedAccountId = state.accounts.length > 0 ? state.accounts[0].id : null;
        }
      })
      // Handle fetchAvailableNumbers
      .addCase(fetchAvailableNumbers.fulfilled, (state, action) => {
        state.availableNumbers = action.payload;
      })
      // Handle fetchActiveNumbers
      .addCase(fetchActiveNumbers.fulfilled, (state, action) => {
        state.activeNumbers = action.payload;
      })
      // Handle fetchTrunks
      .addCase(fetchTrunks.fulfilled, (state, action) => {
        state.trunks = action.payload;
      });
  },
});

export const { 
  setSelectedAccount, 
  clearAvailableNumbers, 
  clearActiveNumbers, 
  clearTrunks 
} = twilioSlice.actions;

// Add new selector functions
export const selectDefaultTwilioAccount = (state: { twilio: TwilioState }) => 
  state.twilio.accounts.find(account => account.is_default);

export const selectAvailableTwilioAccounts = (state: { twilio: TwilioState }) => 
  state.twilio.accounts;

export default twilioSlice.reducer; 