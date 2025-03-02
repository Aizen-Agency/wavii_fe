import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the type for a phone number
interface PhoneNumber {
    id: number;
    phone_number: string;
    status: string;
    assigned_agent_id: string;
    created_at: string;
    updated_at: string;
    phone_number_type: string;
    phone_number_pretty: string;
    agent_id?: string;
    last_modification_timestamp: number;
    friendly_name: string;
    phone_number_sid: string;
    inbound_agent_id?: string;
}

// Define a thunk for fetching phone numbers
export const fetchPhoneNumbers = createAsyncThunk(
  'phoneNumbers/fetchPhoneNumbers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('https://retell-demo-be-cfbda6d152df.herokuapp.com/list-phone-numbers', {
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

// Thunk to fetch available numbers
export const fetchAvailableNumbers = createAsyncThunk(
  'phoneNumbers/fetchAvailableNumbers',
  async ({ accountSid, authToken, countryCode }: { accountSid: string, authToken: string, countryCode: string }, { getState }) => {
    const token = localStorage.getItem('access_token');
    if (!countryCode) {
      countryCode = 'US';
    }
    const getTrunks = await axios.get('https://retell-demo-be-cfbda6d152df.herokuapp.com/get-trunks', {
        headers: {
            'twilio-sid': accountSid,
            'twilio-auth-token': authToken,
            'Authorization': `Bearer ${token}`,
          },
    }); 

    const availableNumbersResponse = await axios.get(`https://retell-demo-be-cfbda6d152df.herokuapp.com/available-numbers?country=${countryCode}`, {
      headers: {
        'twilio-sid': accountSid,
        'twilio-auth-token': authToken,
        'Authorization': `Bearer ${token}`,
      },
    });

    const availableNumbersAlreadybought = await axios.get('https://retell-demo-be-cfbda6d152df.herokuapp.com/active-numbers-twilio', {
        headers: {
          'twilio-sid': accountSid,
          'twilio-auth-token': authToken,
          'Authorization': `Bearer ${token}`,
          'trunksid': getTrunks.data[0].sid,
        },
      });

      const availableNumbers = [...availableNumbersResponse.data, ...availableNumbersAlreadybought.data]
    for (const number of availableNumbers) {
      number.friendly_name = number.friendlyName;
      number.phone_number = number.phoneNumber;
      number.phone_number_sid = number.sid;
    }
    return availableNumbers;
  }
);

// Thunk to activate a number
export const activateNumber = createAsyncThunk(
  'phoneNumbers/activateNumber',
  async (phoneNumber: string, { getState }) => {
    const state: any = getState();
    const response = await axios.post('https://retell-demo-be-cfbda6d152df.herokuapp.com/activate-number', {
      phoneNumber,
    }, {
      headers: {
        'twilio-sid': state.phoneNumbers.accountSid,
        'twilio-auth-token': state.phoneNumbers.authToken,
      },
    });
    return response.data;
  }
);


 // Updated registerToTrunk function to accept an optional phone identifier
  const registerToTrunkFunction = async (phoneId?: string, domain_name?: string, trunk_sid?: string, accountSid?: string, authToken?: string) => {
    // Use the passed-in phoneId if available, otherwise fall back to the state
    const token = localStorage.getItem('access_token');
    const idToRegister = phoneId;
    if (!idToRegister) {
      alert("Please select a phone number to register.");
      return;
    }
    const terminationUri = domain_name + ".pstn.dublin.twilio.com";
    if (!domain_name || !terminationUri) {
      alert("Please select a trunk and ensure termination URI is available.");
      return;
    }

    const payload = {
      // If the identifier is a phone number (starting with '+') then phonesid is null
      phonesid: idToRegister.startsWith('+') ? null : idToRegister,
      termination_uri: terminationUri,
      trunksid: trunk_sid,
      phoneNumbertoadd: idToRegister.startsWith('+') ? idToRegister : null
    };

    try {
      // Ensure accountSid and authToken are defined
      if (!accountSid || !authToken) {
        throw new Error("Account SID and Auth Token must be provided");
      }

      const response = await fetch("https://retell-demo-be-cfbda6d152df.herokuapp.com/register-to-trunk", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "twilio-sid": accountSid,
          "twilio-auth-token": authToken,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Registered to trunk:", data);
        // alert("Phone number successfully registered to trunk.");
        // Optionally refresh active numbers after a successful registration.
        // fetchActiveNumbers();
      } else {
        console.error("Failed to register phone to trunk");
        alert("Failed to register phone to trunk");
      }
    } catch (err) {
      console.error("Error in registerToTrunk:", err);
      alert("Error occurred while registering phone to trunk");
    }
  };

    // Updated createTrunk function to include Twilio credentials in headers
    const createTrunk = async (trunkDomain: string, originationUrlName: string, friendlyName: string, accountSid: string, authToken: string) => {
   

        // Build the payload.
        const payload = {
          DomainName: trunkDomain,
          FriendlyName: friendlyName,
          OriginationUrlName: originationUrlName
        };
    
        try {
          const response = await fetch("https://retell-demo-be-cfbda6d152df.herokuapp.com/create-trunk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "twilio-sid": accountSid,
              "twilio-auth-token": authToken
            },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Trunk created successfully:", data);
            return data;
            // setSelectedTrunk(data);
          } else {
            console.error("Failed to create trunk");
            return null;
          }
        } catch (error) {
          console.error("Error creating trunk:", error);
          return null;
        }
      };
    


// Thunk to register a phone number to a trunk
export const registerToTrunk = createAsyncThunk(
  'phoneNumbers/registerToTrunk',
  async ({ phonesid, accountSid, authToken }: { phonesid: string, accountSid: string, authToken: string }, { getState }) => {
    let domain_name = '';
    let trunk = null;
    const response = await fetch("https://retell-demo-be-cfbda6d152df.herokuapp.com/get-trunks", {
        headers: {
          "Content-Type": "application/json",
          "twilio-sid": accountSid,
          "twilio-auth-token": authToken
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        if(data.length == 0) {
          domain_name = "retell" + Math.random().toString(36).substring(2, 15);
             trunk = await createTrunk(domain_name, domain_name, domain_name, accountSid, authToken);
            if(!trunk) {
              return {error: "Failed to create trunk"};
            }
        } else {
          console.log("Trunks:", data);
          domain_name = data[0].domainName.split('.pstn.twilio.com')[0]; 
        //   setSelectedTrunk(data[0]);
            trunk = data[0];
        }
        await registerToTrunkFunction(phonesid, domain_name, trunk.sid, accountSid, authToken);
        return {success: "Phone number registered to trunk"};
      }
    // registerToTrunkFunction(phonesid)
    return {error: "Failed to register to trunk"};
  }
);

const phoneNumberSlice = createSlice({
  name: 'phoneNumbers',
  initialState: {
    data: [] as PhoneNumber[],
    status: 'idle',
    error: null as string | null,
    availableNumbers: [] as PhoneNumber[],
    activeNumbers: [] as PhoneNumber[],
    accountSid: '', // Ensure these are initialized
    authToken: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhoneNumbers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPhoneNumbers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchPhoneNumbers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchAvailableNumbers.fulfilled, (state, action) => {
        state.availableNumbers = action.payload;
      })
      .addCase(activateNumber.fulfilled, (state, action) => {
        state.activeNumbers.push(action.payload);
        state.availableNumbers = state.availableNumbers.filter(
          number => number.phone_number !== action.payload.phone_number
        );
      })
      .addCase(registerToTrunk.fulfilled, (state, action) => {
        // Handle the successful registration to trunk here
        // For example, you might want to update the state with the new trunk information
      });
  },
});

export default phoneNumberSlice.reducer;