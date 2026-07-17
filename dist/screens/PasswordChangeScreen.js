import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/screens/PasswordChangeScreen.tsx
import { useState, useCallback, useEffect } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, ThemeProvider, Typography, createTheme, } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';
const defaultTexts = {
    'passwordChange.title': 'New password',
    'passwordChange.subtitle': 'Enter and confirm your new password.',
    'passwordChange.newPassword': 'New password',
    'passwordChange.confirmPassword': 'Confirm password',
    'passwordChange.submit': 'Change password',
    'passwordChange.success': 'Password changed successfully.',
    'passwordChange.backToLogin': 'Back to login',
    'passwordChange.invalidToken': 'Invalid or expired recovery link.',
    'error.fillAllFields': 'Please fill in all fields.',
    'error.passwordMismatch': 'Passwords do not match.',
    'error.passwordChangeFailed': 'Failed to change password.',
};
export function PasswordChangeScreen({ logo, title, theme: clientTheme, slots, ssoUrl, loginPath = '/auth/login', token: tokenProp, onSuccess, onError, }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const config = getSsoConfig();
    const translate = config.translater ?? ((key) => defaultTexts[key] ?? key);
    // extrai o token do path /auth/recover/:token se não vier via prop
    const token = tokenProp ?? (() => {
        if (typeof window === 'undefined')
            return null;
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1] || null;
    })();
    const [detectedMode, setDetectedMode] = useState(getInitialThemeMode);
    useEffect(() => {
        if (clientTheme || config.themeMode)
            return;
        const stored = localStorage?.getItem('drawerLayoutTheme');
        if (stored)
            return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => setDetectedMode(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [clientTheme, config.themeMode]);
    const resolvedLogo = logo ?? config.appLogo;
    const resolvedTitle = title ?? config.appTitle ?? translate('passwordChange.title');
    const resolvedTheme = clientTheme ?? (config.themeMode
        ? createTheme({ palette: { mode: config.themeMode } })
        : createTheme({ palette: { mode: detectedMode } }));
    const handleError = useCallback((message) => {
        setError(message);
        onError?.(message);
    }, [onError]);
    const handleSubmit = useCallback(async () => {
        if (!password || !confirm) {
            handleError(translate('error.fillAllFields'));
            return;
        }
        if (password !== confirm) {
            handleError(translate('error.passwordMismatch'));
            return;
        }
        if (!token) {
            handleError(translate('passwordChange.invalidToken'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await fetchCore({
                url: `${ssoUrl ?? config.ssoUrl}/auth/password_change`,
                method: 'POST',
                body: { token, password },
                responseAdapter: config.responseAdapter,
            });
            if (result.success) {
                setSuccess(true);
                onSuccess?.(result.data, '', undefined);
            }
            else {
                handleError(result.message ?? translate('error.passwordChangeFailed'));
            }
        }
        finally {
            setLoading(false);
        }
    }, [password, confirm, token, ssoUrl, config, handleError, onSuccess, translate]);
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
                }, children: [slots?.header ?? (_jsxs(Box, { sx: { textAlign: 'center', mb: 1 }, children: [resolvedLogo && _jsx(Box, { sx: { mb: 1 }, children: resolvedLogo }), _jsx(Typography, { variant: "h5", sx: { fontWeight: 'bold', color: resolvedTheme.palette.text.primary }, children: resolvedTitle })] })), error && _jsx(Alert, { severity: "error", children: translate(error) }), success ? (_jsxs(_Fragment, { children: [_jsx(Alert, { severity: "success", children: translate('passwordChange.success') }), _jsx(Typography, { variant: "body2", sx: { textAlign: 'center' }, children: _jsx(Link, { href: loginPath, children: translate('passwordChange.backToLogin') }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "body2", sx: { color: resolvedTheme.palette.text.secondary }, children: translate('passwordChange.subtitle') }), slots?.extraFields, _jsx(TextField, { label: translate('passwordChange.newPassword'), type: showPassword ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), fullWidth: true, autoComplete: "new-password", slotProps: {
                                    input: {
                                        endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(p => !p), edge: "end", children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                    },
                                } }), _jsx(TextField, { label: translate('passwordChange.confirmPassword'), type: showConfirm ? 'text' : 'password', value: confirm, onChange: e => setConfirm(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), fullWidth: true, autoComplete: "new-password", slotProps: {
                                    input: {
                                        endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowConfirm(p => !p), edge: "end", children: showConfirm ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                    },
                                } }), _jsx(Button, { variant: "contained", fullWidth: true, onClick: handleSubmit, disabled: loading, size: "large", children: loading
                                    ? _jsx(CircularProgress, { size: 24, color: "inherit" })
                                    : translate('passwordChange.submit') }), _jsx(Typography, { variant: "body2", sx: { textAlign: 'center' }, children: _jsx(Link, { href: loginPath, children: translate('passwordChange.backToLogin') }) })] })), slots?.footer] }) }) }));
}
