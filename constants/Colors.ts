// constants/Colors.ts
export interface ColorTheme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  tint: string;
  blue: string;
  purple: string;
  green: string;
  red: string;
  white: string;
  black: string;
}

export const DarkTheme: ColorTheme = {
  background: '#131313ff',
  surface: '#1a1a1aff',
  card: '#2c2c2cff',
  text: '#FFFFFF',
  textSecondary: '#999999',
  border: '#333333',
  tint: '#198a00ff',
  blue: '#86d3ffff',
  purple: '#b28dff',
  green: '#4dff7cff',
  red: '#ff6b6bff',
  white: '#FFFFFF',
  black: '#0d0d0dff',
};

export const LightTheme: ColorTheme = {
  background: '#FFFFFF',
  surface: '#e0e0e0ff',
  card: '#ffffffff',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  tint: '#198a00ff',
  blue: '#4A90E2',
  purple: '#8B5FD6',
  green: '#22C55E',
  red: '#EF4444',
  white: '#000000', // Use black for white elements in light theme (for better contrast)
  black: '#FFFFFF', // Use white for black elements in light theme
};

// Legacy export for backward compatibility
export default {
  black: '#131313ff',
  grey: '#1a1a1aff',
  white: '#FFFFFF',
  tintColor: '#198a00ff',
  blue: '#86d3ffff',
  lightGrey: '#2c2c2cff',
  darkGrey: '#0d0d0dff',
  softPurple: '#b28dff',
  softBlue: '#a7e9ff',
  accentGreen: '#4dff7cff',
  accentRed: '#ff6b6bff',
};

export const getTheme = (themeName: 'dark' | 'light'): ColorTheme => {
  return themeName === 'light' ? LightTheme : DarkTheme;
};