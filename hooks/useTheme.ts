import { getTheme, type ColorTheme } from '@/constants/Colors';
import { useAppSelector } from '@/store/hooks';

/**
 * Custom hook to get theme-aware colors based on user's selected theme
 */
export const useTheme = (): ColorTheme => {
  const theme = useAppSelector((state) => state.user.profile.theme);
  return getTheme(theme);
};
