import { getCurrencySymbol } from '@/constants/currencies';
import type { RootState } from '@/store/store';

/**
 * Format a numeric amount with the user's selected currency symbol
 */
export const formatCurrency = (amount: number, state: RootState): string => {
  const currencyCode = state.user.profile.currency || 'USD';
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Format a numeric amount with currency symbol (no decimals)
 */
export const formatCurrencyShort = (amount: number, state: RootState): string => {
  const currencyCode = state.user.profile.currency || 'USD';
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(0)}`;
};

/**
 * Get just the currency symbol from state
 */
export const getCurrencySymbolFromState = (state: RootState): string => {
  const currencyCode = state.user.profile.currency || 'USD';
  return getCurrencySymbol(currencyCode);
};
