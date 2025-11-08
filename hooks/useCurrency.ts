import { getCurrencySymbol } from '@/constants/currencies';
import { useAppSelector } from '@/store/hooks';

/**
 * Custom hook for currency formatting using user's selected currency
 */
export const useCurrency = () => {
  const currencyCode = useAppSelector((state) => state.user.profile.currency);
  const symbol = getCurrencySymbol(currencyCode);

  const formatCurrency = (amount: number, decimals: number = 2): string => {
    return `${symbol}${amount.toFixed(decimals)}`;
  };

  const formatShort = (amount: number): string => {
    return `${symbol}${amount.toFixed(0)}`;
  };

  return {
    symbol,
    currencyCode,
    formatCurrency,
    formatShort,
  };
};
