import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/screens/RegisterScreen.tsx
import { useState, useCallback, useEffect } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, Link, TextField, ThemeProvider, Typography, createTheme, } from '@mui/material';
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { getSocialLoginUrl } from '../sso/authService.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';
const defaultTexts = {
    'register.title': 'Login',
    'register.identifier': 'Email or username',
    'register.password': 'Password',
    'register.confirm_password': 'Confirm password',
    'register.submit': 'Sign in',
    'register.forgotPassword': 'Forgot password?',
    'register.noAccount': "Don't have an account?",
    'register.login': 'Log in',
    'register.orWith': 'or',
    'register.register': 'Register',
    'register.already_account': 'Do you already have an account?',
    'register.socialWith': 'Sign in with',
    'register.success': 'Registration successful!',
    'register.passowrdsNotMath': 'Passowords not math',
    'error.fillAllFields': 'Please fill in all fields.',
    'error.registerFailed': 'Registration failed.',
    'error.getSocialUrlFail': 'Failed to retrieve social login URL.',
    "error.invalidParameters": "invalid parameters",
    "error.socialSignFail": "Fail on social login",
};
export function RegisterScreen({ logo, title, theme: clientTheme, slots, ssoUrl, loginPath = '/auth/login', socialLogins = [], onSuccess, onError }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const config = getSsoConfig();
    // detecta tema inicial e reage a mudanças do sistema em tempo real
    const [detectedMode, setDetectedMode] = useState(getInitialThemeMode);
    const translate = config.translater ?? ((key) => defaultTexts[key] ?? key);
    const resolvedLogo = logo ?? config.appLogo;
    const resolvedTitle = title ?? config.appTitle ?? translate('register.title');
    const resolvedTheme = clientTheme ?? (config.themeMode
        ? createTheme({ palette: { mode: config.themeMode } })
        : createTheme({ palette: { mode: detectedMode } }));
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
        if (!identifier || !password || !confirm) {
            handleError(translate('error.fillAllFields'));
            return;
        }
        if (password !== confirm) {
            handleError(translate('register.passowrdsNotMath'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const config = getSsoConfig();
            const result = await fetchCore({
                url: `${ssoUrl ?? config.ssoUrl}${config.ssoRegisterEndpoint}`,
                method: 'POST',
                body: { identifier, password },
                responseAdapter: config.responseAdapter,
            });
            if (result.success) {
                setSuccess(true);
                onSuccess?.(result.data, '', undefined);
            }
            else {
                handleError(result.message ?? 'error.registerFailed');
            }
        }
        finally {
            setLoading(false);
        }
    }, [identifier, password, confirm, ssoUrl, onSuccess, handleError]);
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
                handleError(urlResult.message ?? translate('error.getSocialUrlFail'));
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
                }, children: [slots?.header ?? (_jsxs(Box, { sx: { textAlign: 'center', mb: 1 }, children: [resolvedLogo && _jsx(Box, { sx: { mb: 1 }, children: resolvedLogo }), _jsx(Typography, { variant: "h5", sx: { fontWeight: "bold", color: resolvedTheme.palette.text.primary }, children: resolvedTitle })] })), error && _jsx(Alert, { severity: "error", children: translate(error) }), success ? (_jsxs(Alert, { severity: "success", children: [translate('register.success'), ' ', _jsx(Link, { href: loginPath, children: translate('register.login') })] })) : (_jsxs(_Fragment, { children: [slots?.extraFields, _jsx(TextField, { label: translate('register.identifier'), value: identifier, onChange: e => setIdentifier(e.target.value), fullWidth: true, autoComplete: "username" }), _jsx(TextField, { label: translate('register.password'), type: "password", value: password, onChange: e => setPassword(e.target.value), fullWidth: true, autoComplete: "new-password" }), _jsx(TextField, { label: translate('register.confirm_password'), type: "password", value: confirm, onChange: e => setConfirm(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), fullWidth: true, autoComplete: "new-password" }), _jsx(Button, { variant: "contained", fullWidth: true, onClick: handleSubmit, disabled: loading, size: "large", children: loading ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : translate('register.register') }), socialLogins && socialLogins.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Divider, { sx: { color: resolvedTheme.palette.text.primary }, children: translate('register.orWith') }), socialLogins.map(social => (_jsx(Button, { variant: "outlined", fullWidth: true, onClick: () => handleSocialLogin(social), disabled: !!socialLoading, startIcon: socialLoading === social.provider
                                            ? _jsx(CircularProgress, { size: 18 })
                                            : social.icon, children: social.label ?? `${translate('register.socialWith')} ${social.provider}` }, social.provider)))] })), _jsxs(Typography, { variant: "body2", sx: { textAlign: "center", color: resolvedTheme.palette.text.primary }, children: [translate('register.already_account'), ' ', _jsx(Link, { href: loginPath, children: translate('register.login') })] })] })), slots?.footer] }) }) }));
}
