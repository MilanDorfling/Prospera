import { createSavingsGoal, deleteSavingsGoal, fetchSavingsGoals, updateSavingsGoal, updateSavingsGoalProgress } from '@/api/api';
import { SavingsGoal } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface SavingsState {
  goals: SavingsGoal[];
  loading: boolean;
  error: string | null;
}

const initialState: SavingsState = {
  goals: [],
  loading: false,
  error: null,
};

export const fetchAllGoals = createAsyncThunk(
  'savings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[savings] fetchAll start');
      const response = await fetchSavingsGoals();
      console.log('[savings] fetchAll success', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[savings] fetchAll error', error);
      return rejectWithValue('Failed to fetch savings goals');
    }
  }
);

export const addGoal = createAsyncThunk(
  'savings/add',
  async (goal: Omit<SavingsGoal, '_id' | 'id' | 'userToken' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      console.log('[savings] addGoal', goal);
      const response = await createSavingsGoal(goal);
      console.log('[savings] addGoal success', response.data);
      return response.data;
    } catch (error) {
      console.error('[savings] addGoal error', error);
      return rejectWithValue('Failed to create savings goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'savings/update',
  async ({ id, update }: { id: string; update: Partial<SavingsGoal> }, { rejectWithValue }) => {
    try {
      console.log('[savings] updateGoal', id, update);
      const response = await updateSavingsGoal(id, update);
      console.log('[savings] updateGoal success', response.data);
      return response.data;
    } catch (error) {
      console.error('[savings] updateGoal error', error);
      return rejectWithValue('Failed to update savings goal');
    }
  }
);

export const updateGoalProgress = createAsyncThunk(
  'savings/updateProgress',
  async ({ id, currentAmount }: { id: string; currentAmount: number }, { rejectWithValue }) => {
    try {
      console.log('[savings] updateProgress', id, currentAmount);
      const response = await updateSavingsGoalProgress(id, currentAmount);
      console.log('[savings] updateProgress success', response.data);
      return response.data;
    } catch (error) {
      console.error('[savings] updateProgress error', error);
      return rejectWithValue('Failed to update goal progress');
    }
  }
);

export const removeGoal = createAsyncThunk(
  'savings/remove',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('[savings] removeGoal', id);
      await deleteSavingsGoal(id);
      console.log('[savings] removeGoal success');
      return id;
    } catch (error) {
      console.error('[savings] removeGoal error', error);
      return rejectWithValue('Failed to delete savings goal');
    }
  }
);

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchAllGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add goal
      .addCase(addGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
        state.loading = false;
      })
      .addCase(addGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const updated = action.payload;
        const key = updated._id || updated.id;
        const idx = state.goals.findIndex(g => (g._id || g.id) === key);
        if (idx !== -1) {
          state.goals[idx] = updated;
        }
        state.loading = false;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update progress
      .addCase(updateGoalProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        const updated = action.payload;
        const key = updated._id || updated.id;
        const idx = state.goals.findIndex(g => (g._id || g.id) === key);
        if (idx !== -1) {
          state.goals[idx] = updated;
        }
        state.loading = false;
      })
      .addCase(updateGoalProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove goal
      .addCase(removeGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(g => (g._id || g.id) !== action.payload);
        state.loading = false;
      })
      .addCase(removeGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default savingsSlice.reducer;
