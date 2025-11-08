import { configureStore } from '@reduxjs/toolkit';
import expenseReducer from './slices/expenseSlice';
import incomeReducer from './slices/incomeSlice';
import savingsReducer from './slices/savingsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    expenses: expenseReducer,
    income: incomeReducer,
    user: userReducer,
    savings: savingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/setToken'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;