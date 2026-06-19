import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/screens/LoginScreen.tsx
import { useState, useCallback, useEffect } from 'react';
import { Box, Button, CircularProgress, Divider, IconButton, InputAdornment, Link, TextField, ThemeProvider, Typography, createTheme, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.js';
import { login, getSocialLoginUrl } from '../sso/authService.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';
const defaultTexts = {
    'login.title': 'Login',
    'login.identifier': 'Email or username',
    'login.password': 'Password',
    'login.submit': 'Sign in',
    'login.forgotPassword': 'Forgot password?',
    'login.noAccount': "Don't have an account?",
    'login.register': 'Sign up',
    'login.orWith': 'or',
    'login.socialWith': 'Sign in with',
    'error.fillAllFields': 'Please fill in all fields.',
    'error.authFailed': 'Authentication failed.',
    'error.getSocialUrlFail': 'Failed to retrieve social login URL',
    "error.invalidParameters": "invalid parameters",
    "error.socialSignFail": "Fail on social login"
};
export function LoginScreen({ logo, title, theme: clientTheme, slots, ssoUrl, socialLogins, registerPath = '/auth/register', recoverPath = '/auth/recover', onSuccess, onError }) {
    const { login: authLogin } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [error, setError] = useState(null);
    const config = getSsoConfig();
    // detecta tema inicial e reage a mudanças do sistema em tempo real
    const [detectedMode, setDetectedMode] = useState(getInitialThemeMode);
    useEffect(() => {
        // só escuta se não há tema externo nem config forçando um modo
        if (clientTheme || config.themeMode)
            return;
        const stored = localStorage?.getItem('drawerLayoutTheme');
        if (stored)
            return; // usuário já escolheu manualmente
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => setDetectedMode(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [clientTheme, config.themeMode]);
    const handleError = useCallback((message) => {
        setError(message);
        onError?.(message);
    }, [onError]);
    const handleSubmit = useCallback(async () => {
        if (!identifier || !password) {
            handleError(translate('error.fillAllFields'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await login({
                identifier,
                password,
                url: ssoUrl ?? config.ssoUrl,
            });
            if (result.success && result.data?.token) {
                authLogin(result.data.token, result.data.refreshToken, result.data.agent);
                onSuccess?.(result.data.token, result.data.refreshToken, result.data.agent);
                // se estava numa rota de auth, volta para a raiz após login
                if (typeof window !== 'undefined' &&
                    window.location.pathname.startsWith('/auth/')) {
                    window.location.replace('/');
                }
            }
            else {
                handleError(result.message ?? 'error.authFailed');
            }
        }
        finally {
            setLoading(false);
        }
    }, [identifier, password, ssoUrl, authLogin, onSuccess, handleError]);
    const translate = config.translater ?? ((key) => defaultTexts[key] ?? key);
    const resolvedLogo = logo ?? config.appLogo;
    const resolvedTitle = title ?? config.appTitle ?? translate('login.title');
    const resolvedTheme = clientTheme ?? (config.themeMode
        ? createTheme({ palette: { mode: config.themeMode } })
        : createTheme({ palette: { mode: detectedMode } }));
    const handleSocialLogin = useCallback(async (social) => {
        setSocialLoading(social.provider);
        setError(null);
        try {
            const config = getSsoConfig();
            // passo 1: buscar URL de login do SSO
            const urlResult = await getSocialLoginUrl({
                provider: social.provider,
                redirectUri: social.redirectUri,
                url: ssoUrl ?? config.ssoUrl,
            });
            if (!urlResult.success || !urlResult.data) {
                handleError(urlResult.message ?? 'error.getSocialUrlFail');
                return;
            }
            // passo 2: salvar provider e redirectUri para usar no retorno
            sessionStorage.setItem('sso_social_provider', social.provider);
            sessionStorage.setItem('sso_social_redirect_uri', social.redirectUri);
            // passo 3: redirecionar
            window.location.href = urlResult.data;
        }
        finally {
            setSocialLoading(null);
        }
    }, [ssoUrl, handleError]);
    return (_jsx(ThemeProvider, { theme: resolvedTheme, children: _jsx(Box, { sx: {
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }, children: _jsxs(Box, { sx: {
                    width: '100%',
                    maxWidth: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 3,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }, children: [slots?.header ?? (_jsxs(Box, { sx: { textAlign: 'center', mb: 1 }, children: [resolvedLogo && _jsx(Box, { sx: { mb: 1 }, children: resolvedLogo }), _jsx(Typography, { variant: "h5", sx: { fontWeight: "bold", color: resolvedTheme.palette.text.primary }, children: resolvedTitle })] })), error && _jsx(Alert, { severity: "error", children: translate(error) }), slots?.extraFields, _jsx(TextField, { label: translate('login.identifier'), value: identifier, onChange: e => setIdentifier(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), fullWidth: true, autoComplete: "username" }), _jsx(TextField, { label: translate('login.password'), type: showPassword ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), fullWidth: true, autoComplete: "current-password", slotProps: {
                            input: {
                                endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(p => !p), edge: "end", children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                            }
                        } }), _jsx(Box, { sx: { textAlign: 'right', mt: -1 }, children: _jsx(Link, { href: recoverPath, variant: "body2", children: translate('login.forgotPassword') }) }), _jsx(Button, { variant: "contained", fullWidth: true, onClick: handleSubmit, disabled: loading, size: "large", children: loading ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : translate('login.submit') }), socialLogins && socialLogins.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Divider, { sx: { color: resolvedTheme.palette.text.primary }, children: translate('login.orWith') }), socialLogins.map(social => (_jsx(Button, { variant: "outlined", fullWidth: true, onClick: () => handleSocialLogin(social), disabled: !!socialLoading, startIcon: socialLoading === social.provider
                                    ? _jsx(CircularProgress, { size: 18 })
                                    : social.icon, children: social.label ?? `${translate('login.socialWith')} ${social.provider}` }, social.provider)))] })), registerPath && (_jsxs(Typography, { variant: "body2", sx: { textAlign: "center", color: resolvedTheme.palette.text.primary }, children: [translate('login.noAccount'), ' ', _jsx(Link, { href: registerPath, children: translate('login.register') })] })), slots?.footer] }) }) }));
}
