import { createIncome, fetchIncome, updateIncome as updateIncomeAPI } from '@/api/api';
import { IncomeType } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IncomeState {
  items: IncomeType[];
  loading: boolean;
  error: string | null;
}

const initialState: IncomeState = {
  items: [],
  loading: false,
  error: null,
};

// Normalize income list to ensure one entry per category name and consistent typing
// Backend returns income sorted by createdAt DESC (newest first), so we want the FIRST
// occurrence per name to win. Do not overwrite if a name already exists in the map.
export const normalizeIncome = (items: any[]): IncomeType[] => {
  const byName = new Map<string, IncomeType>();
  for (const raw of items || []) {
    if (!raw || !raw.name) continue;
    if (!byName.has(raw.name)) {
      const item: IncomeType = {
        _id: raw._id,
        id: raw.id,
        name: raw.name,
        amount: raw.amount != null ? String(raw.amount) : '0.00',
        createdAt: raw.createdAt,
      } as IncomeType;
      byName.set(item.name, item);
    }
  }

  const order = ['Salary', 'Freelance', 'Investments'];
  const ordered: IncomeType[] = [];
  for (const name of order) {
    const it = byName.get(name);
    if (it) {
      ordered.push(it);
      byName.delete(name);
    }
  }
  // Append any other categories
  for (const it of byName.values()) ordered.push(it);
  return ordered;
};

export const fetchAllIncome = createAsyncThunk(
  'income/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[income] fetchAll start');
      const response = await fetchIncome();
      const incomeData = response.data;
      console.log('[income] fetchAll success', Array.isArray(incomeData) ? incomeData.length : 'n/a');
      
      // If no income data exists, create default categories
      if (!incomeData || incomeData.length === 0) {
  console.log('[income] No data found, creating defaults...');
        const defaultIncome = [
          { name: 'Salary', amount: 0 },
          { name: 'Freelance', amount: 0 },
          { name: 'Investments', amount: 0 }
        ];
        // Create these default categories in the backend
        for (const income of defaultIncome) {
          await createIncome(income);
        }
        // After creating defaults, re-fetch from backend to get real IDs
        const refreshed = await fetchIncome();
        console.log('[income] Created defaults, refetched:', refreshed.data?.length ?? 'n/a');
        return refreshed.data || [];
      }
      
      return incomeData;
    } catch (error) {
      console.error('[income] fetchAll error:', error);
      return rejectWithValue('Failed to fetch income');
    }
  }
);

export const addIncome = createAsyncThunk(
  'income/add',
  async (income: Omit<IncomeType, 'id'>, { rejectWithValue }) => {
    try {
      console.log('[income] addIncome', income);
      const response = await createIncome(income);
      console.log('[income] addIncome success', response.data);
      return response.data;
    } catch (error) {
      console.error('[income] addIncome error', error);
      return rejectWithValue('Failed to add income');
    }
  }
);

export const updateIncome = createAsyncThunk(
  'income/update',
  async ({ id, amount }: { id: string; amount: number }, { rejectWithValue }) => {
    try {
      console.log('[income] updateIncome', { id, amount });
      const response = await updateIncomeAPI(id, { amount });
      console.log('[income] updateIncome success', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[income] updateIncome error:', error?.response?.data || error?.message || error);
      return rejectWithValue(error?.response?.data?.error || 'Failed to update income');
    }
  }
);

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch income
      .addCase(fetchAllIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllIncome.fulfilled, (state, action) => {
        state.items = normalizeIncome(action.payload as any[]);
        state.loading = false;
      })
      .addCase(fetchAllIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add income
      .addCase(addIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        state.items = normalizeIncome([...state.items, action.payload]);
        state.loading = false;
      })
      .addCase(addIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update income
      .addCase(updateIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        const payload: any = action.payload || {};
        const key = payload._id || payload.id;
        if (key) {
          const index = state.items.findIndex(item => (item._id || item.id) === key);
          if (index !== -1) {
            state.items[index] = {
              ...state.items[index],
              ...payload,
              amount: String(payload.amount ?? state.items[index].amount),
            } as IncomeType;
          } else {
            // If not found (edge case), append then normalize to ensure dedupe
            state.items.push({
              ...(payload as any),
              amount: String(payload.amount ?? '0.00'),
            });
          }
        }
        // Always re-normalize to eliminate any duplicates and keep stable order
        state.items = normalizeIncome(state.items as any[]);
        state.loading = false;
      })
      .addCase(updateIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default incomeSlice.reducer;