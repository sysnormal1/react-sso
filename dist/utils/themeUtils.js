// src/utils/themeUtils.ts
const STORAGE_KEY = 'sysnormalTheme'; // chave comum de sysnormal
export function getSystemTheme() {
    if (typeof window === 'undefined')
        return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function getInitialThemeMode() {
    if (typeof window === 'undefined')
        return 'light';
    const stored = localStorage?.getItem(STORAGE_KEY);
    return stored ?? getSystemTheme();
}
