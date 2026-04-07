import { useThemeStore } from '../store/theme.store';

export const useTheme = () => {
  const { theme } = useThemeStore();
  const colors = {
    primary: 'var(--color-primary)',
    primaryLight: 'var(--color-primary-light)',
    bg: 'var(--color-bg)',
    bgCard: 'var(--color-bg-card)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
  };
  return { theme, colors };
};

export const themeBgCard = { backgroundColor: 'var(--color-bg-card)' };
export const themeBorder = { borderColor: 'var(--color-border)' };
export const themeText = { color: 'var(--color-text)' };
export const themeTextMuted = { color: 'var(--color-text-muted)' };
export const themePrimary = { color: 'var(--color-primary)' };
