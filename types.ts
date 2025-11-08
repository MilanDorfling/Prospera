export interface ExpenseType {
  _id?: string;
  id?: string;
  name: string;
  amount: number;
  percentage?: string;
  color?: string;
  category?: string; // canonical id (e.g., 'shopping')
  date?: string; // legacy client-side date (if any)
  createdAt?: string; // backend timestamp used for grouping
}

export interface IncomeType {
  id: string;
  name: string;
  amount: string;
  _id?: string; // MongoDB ID
  createdAt?: string; // timestamp from backend
}

export interface SpendingType {
  id: string;
  name: string;
  amount: string;
  date: string;
}

export interface SavingsGoal {
  _id?: string;
  id?: string;
  userToken: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string
  icon: 'car' | 'home' | 'airplane' | 'school' | 'heart-pulse' | 'piggy-bank' | 'star';
  color?: string; // optional user-selected color
  monthlyContribution?: number;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}