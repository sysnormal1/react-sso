// src/utils/themeUtils.ts

import { PaletteMode } from '@mui/material';

const STORAGE_KEY = 'sysnormalTheme'; // chave comum de sysnormal

export function getSystemTheme(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getInitialThemeMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage?.getItem(STORAGE_KEY) as PaletteMode | null;
  return stored ?? getSystemTheme();
}