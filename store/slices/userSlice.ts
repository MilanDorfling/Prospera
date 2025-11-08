import { getOrCreateUserToken } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  name: string;
  profilePhoto: string | null;
  currency: string; // currency code e.g., 'USD'
  theme: 'dark' | 'light';
  monthlyBudget: number | null;
  notificationsEnabled: boolean;
  language: string; // e.g., 'en', 'es', 'fr'
  hapticFeedbackEnabled: boolean;
}

interface UserState {
  token: string | null;
  profile: UserProfile;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  token: null,
  profile: {
    name: '',
    profilePhoto: null,
    currency: 'USD',
    theme: 'dark',
    monthlyBudget: null,
    notificationsEnabled: true,
    language: 'en',
    hapticFeedbackEnabled: true,
  },
  loading: false,
  error: null,
};

export const initializeUser = createAsyncThunk(
  'user/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getOrCreateUserToken();
      
      // Load profile from AsyncStorage
      const profileJson = await AsyncStorage.getItem('userProfile');
      const profile = profileJson ? JSON.parse(profileJson) : null;
      
      return { token, profile };
    } catch (error) {
      return rejectWithValue('Failed to initialize user token');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<UserProfile>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const updatedProfile = { ...state.user.profile, ...updates };
      
      // Persist to AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // TODO: Sync with backend when user routes are ready
      // await axios.put('/api/user/profile', updatedProfile, { headers: { Authorization: state.user.token } });
      
      return updatedProfile;
    } catch (error) {
      return rejectWithValue('Failed to update profile');
    }
  }
);

export const resetAllAppData = createAsyncThunk(
  'user/resetAllAppData',
  async (_, { rejectWithValue }) => {
    try {
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      
      // TODO: Call backend to delete all user data when implemented
      // await axios.delete('/api/user/data', { headers: { Authorization: token } });
      
      return true;
    } catch (error) {
      return rejectWithValue('Failed to reset app data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    setProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    resetAppData: (state) => {
      // This will be called after resetAllAppData thunk succeeds
      // Reset to initial state while keeping token for new session
      const currentToken = state.token;
      return { ...initialState, token: currentToken };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.profile) {
          state.profile = { ...state.profile, ...action.payload.profile };
        }
        state.loading = false;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(resetAllAppData.fulfilled, (state) => {
        // Reset state while keeping token
        const currentToken = state.token;
        Object.assign(state, { ...initialState, token: currentToken });
      })
      .addCase(resetAllAppData.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setToken, clearToken, setProfile, resetAppData } = userSlice.actions;
export default userSlice.reducer;