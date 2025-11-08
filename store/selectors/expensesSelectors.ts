import { normalizeCategoryId } from '@/constants/categories';
import { ExpenseType } from '@/types';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type Timeframe = 'week' | 'month' | 'year';

// ---- Date helpers ----
function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function addMonths(d: Date, months: number) {
  const n = new Date(d);
  n.setMonth(n.getMonth() + months);
  return n;
}

function addYears(d: Date, years: number) {
  const n = new Date(d);
  n.setFullYear(n.getFullYear() + years);
  return n;
}

export interface TimeframeBounds { start: Date; end: Date; }

export function computeTimeframeBounds(timeframe: Timeframe, now: Date = new Date()): TimeframeBounds {
  if (timeframe === 'week') {
    const start = startOfWeek(now);
    const end = addDays(start, 7);
    return { start, end };
  }
  if (timeframe === 'month') {
    const start = startOfMonth(now);
    const end = addMonths(start, 1);
    return { start, end };
  }
  const start = startOfYear(now);
  const end = addYears(start, 1);
  return { start, end };
}

export function computePreviousBounds(timeframe: Timeframe, now: Date = new Date()): TimeframeBounds {
  if (timeframe === 'week') {
    const thisWeekStart = startOfWeek(now);
    const end = thisWeekStart; // previous week end (exclusive)
    const start = addDays(thisWeekStart, -7);
    return { start, end };
  }
  if (timeframe === 'month') {
    const thisMonthStart = startOfMonth(now);
    const end = thisMonthStart;
    const start = addMonths(thisMonthStart, -1);
    return { start, end };
  }
  const thisYearStart = startOfYear(now);
  const end = thisYearStart;
  const start = addYears(thisYearStart, -1);
  return { start, end };
}

// ---- Base selectors ----
const selectAllExpenses = (state: RootState) => state.expenses.items as ExpenseType[];

// We pass timeframe + now through a tiny input selector so memoization keys remain stable.
const selectTimeframeArg = (_: RootState, timeframe: Timeframe) => timeframe;
const selectCategoryArg = (_: RootState, _tf: Timeframe, category: string) => category;

// Filter expenses inside timeframe.
export const selectExpensesInTimeframe = createSelector(
  [selectAllExpenses, selectTimeframeArg],
  (expenses, timeframe) => {
    const { start, end } = computeTimeframeBounds(timeframe);
    return expenses.filter(e => {
      const rawDate = (e as any).createdAt || (e as any).date;
      if (!rawDate) return false;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return false;
      return d >= start && d < end;
    });
  }
);

export interface CategoryTotal { category: string; total: number; }

export const selectCategoryTotals = createSelector(
  [selectExpensesInTimeframe],
  (expenses): CategoryTotal[] => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      const cat = normalizeCategoryId(e.category);
      map.set(cat, (map.get(cat) || 0) + (e.amount || 0));
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }));
  }
);

export const selectSortedCategoryTotals = createSelector(
  [selectCategoryTotals],
  (arr) => [...arr].sort((a, b) => b.total - a.total)
);

export const selectTimeframeTotal = createSelector(
  [selectExpensesInTimeframe],
  (expenses) => expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
);

export const selectCategoryPercentages = createSelector(
  [selectSortedCategoryTotals, selectTimeframeTotal],
  (totals, timeframeTotal) => {
    if (timeframeTotal <= 0) return totals.map(t => ({ ...t, percent: 0 }));
    return totals.map(t => ({ ...t, percent: (t.total / timeframeTotal) * 100 }));
  }
);

export const selectExpensesForCategoryInTimeframe = createSelector(
  [selectExpensesInTimeframe, selectTimeframeArg, selectCategoryArg],
  (expenses, _tf, category) => {
    const id = normalizeCategoryId(category);
    const filtered = expenses.filter(e => normalizeCategoryId(e.category) === id);
    return filtered.sort((a, b) => {
      const da = new Date((a as any).createdAt || (a as any).date || 0).getTime();
      const db = new Date((b as any).createdAt || (b as any).date || 0).getTime();
      return db - da;
    });
  }
);

// Previous period total for delta calculation
export const selectPreviousPeriodTotal = createSelector(
  [selectAllExpenses, selectTimeframeArg],
  (expenses, timeframe) => {
    const { start, end } = computePreviousBounds(timeframe);
    return expenses.reduce((sum, e) => {
      const rawDate = (e as any).createdAt || (e as any).date;
      if (!rawDate) return sum;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return sum;
      if (d >= start && d < end) return sum + (e.amount || 0);
      return sum;
    }, 0);
  }
);

export const selectDeltaPercent = createSelector(
  [selectTimeframeTotal, selectPreviousPeriodTotal],
  (current, prev) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / prev) * 100;
  }
);
