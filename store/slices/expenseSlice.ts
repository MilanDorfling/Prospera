import { updateExpense as apiUpdateExpense, createExpense, deleteExpense, fetchExpenses } from '@/api/api';
import { findCategoryByColor, normalizeCategoryId } from '@/constants/categories';
import { ExpenseType } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ExpenseState {
  items: ExpenseType[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAllExpenses = createAsyncThunk(
  'expenses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[expenses] fetchAllExpenses start');
      const response = await fetchExpenses();
      console.log('[expenses] fetchAllExpenses success', Array.isArray(response.data) ? response.data.length : 'n/a');
      return response.data;
    } catch (error) {
      console.error('[expenses] fetchAllExpenses error', error);
      return rejectWithValue('Failed to fetch expenses');
    }
  }
);

export const addExpense = createAsyncThunk(
  'expenses/add',
  async (expense: Omit<ExpenseType, 'id'>, { rejectWithValue }) => {
    try {
      console.log('[expenses] addExpense', expense);
      const response = await createExpense(expense);
      console.log('[expenses] addExpense success', response.data);
      return response.data;
    } catch (error) {
      console.error('[expenses] addExpense error', error);
      return rejectWithValue('Failed to add expense');
    }
  }
);

export const removeExpense = createAsyncThunk(
  'expenses/remove',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('[expenses] removeExpense', id);
      await deleteExpense(id);
      console.log('[expenses] removeExpense success');
      return id;
    } catch (error) {
      console.error('[expenses] removeExpense error', error);
      return rejectWithValue('Failed to delete expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async (
    payload: { id: string; update: Partial<ExpenseType> },
    { rejectWithValue }
  ) => {
    try {
      console.log('[expenses] updateExpense', payload);
      const response = await apiUpdateExpense(payload.id, payload.update);
      console.log('[expenses] updateExpense success', response.data);
      return response.data as ExpenseType;
    } catch (error) {
      console.error('[expenses] updateExpense error', error);
      return rejectWithValue('Failed to update expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchAllExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllExpenses.fulfilled, (state, action) => {
        // Normalize and recover categories when missing (migration for older docs)
        const payload = (action.payload as any[]) || [];
        state.items = payload.map((e: any) => {
          const hasCat = e?.category != null && e.category !== '';
          const recovered = hasCat ? normalizeCategoryId(e.category) : (findCategoryByColor(e?.color) || 'uncategorized');
          return { ...e, category: recovered } as ExpenseType;
        });
        state.loading = false;
      })
      .addCase(fetchAllExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add expense
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        // Ensure category is preserved in state even if backend didn't echo it (e.g., server not restarted after schema change)
        const payload = action.payload as any;
        const requested = (action as any).meta?.arg as Partial<ExpenseType> | undefined;
        const merged = { ...payload, category: payload?.category ?? requested?.category ?? 'uncategorized' } as ExpenseType;
        state.items.push(merged);
        state.loading = false;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove expense
      .addCase(removeExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeExpense.fulfilled, (state, action) => {
        state.items = state.items.filter(item => (item.id ?? (item as any)._id) !== action.payload);
        state.loading = false;
      })
      .addCase(removeExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        // Same safeguard for category when updating
        const updated = action.payload as any;
        const requested = (action as any).meta?.arg?.update as Partial<ExpenseType> | undefined;
        const merged = { ...updated, category: normalizeCategoryId(updated?.category ?? requested?.category) } as ExpenseType;
        const key = updated.id ?? updated._id;
        const idx = state.items.findIndex(it => (it.id ?? (it as any)._id) === key);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...merged } as ExpenseType;
        }
        state.loading = false;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default expenseSlice.reducer;