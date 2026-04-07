import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);

export const themeColors = {
  dark: {
    primary: '#7AAACE',
    primaryLight: '#9CD5FF',
    bg: '#355872',
    bgCard: '#2a4458',
    border: '#4a7a9a',
    text: '#F7F8F0',
    textMuted: '#9CD5FF',
    accent: '#9CD5FF',
    accent2: '#7AAACE',
    bgLight: '#355872',
  },
  light: {
    primary: '#355872',
    primaryLight: '#7AAACE',
    bg: '#F7F8F0',
    bgCard: '#ffffff',
    border: '#9CD5FF',
    text: '#355872',
    textMuted: '#7AAACE',
    accent: '#355872',
    accent2: '#7AAACE',
    bgLight: '#9CD5FF',
  },
};
