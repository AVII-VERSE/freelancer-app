import { useEffect } from 'react';
import { useThemeStore, themeColors } from '../../store/theme.store';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const colors = themeColors[theme];

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-bg-card', colors.bgCard);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    
    body.setAttribute('data-theme', theme);
    body.style.backgroundColor = colors.bg;
    body.style.color = colors.text;
  }, [theme, colors]);

  return <>{children}</>;
}
