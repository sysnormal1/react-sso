import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/screens/RecoverScreen.tsx
import { useState, useCallback } from 'react';
import { Alert, Box, Button, CircularProgress, Link, TextField, ThemeProvider, Typography, createTheme, } from '@mui/material';
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
const defaultTexts = {
    'recover.title': 'Password recover',
    'recover.subtitle': 'Enter your email or registered username and we will send you instructions to recover your password.',
    'recover.success_message': 'Instructions sent to your email.',
    'recover.back_to_login': 'Back to login',
    'recover.identifier': 'Email or username',
    'recover.password': 'Password',
    'recover.submit': 'Sign in',
    'recover.send_instructions': 'Send instructions',
    'recover.forgotPassword': 'Forgot password?',
    'recover.noAccount': "Don't have an account?",
    'recover.register': 'Sign up',
    'recover.orWith': 'or',
    'recover.socialWith': 'Sign in with',
    'error.fillAllFields': 'Please fill in all fields.',
    'error.recoverFailed': 'Recorer request failed.',
};
const defaultTheme = createTheme();
export function RecoverScreen({ logo, title = 'Password recover', theme = defaultTheme, slots, ssoUrl, loginPath = '/auth/login', onSuccess, onError, t }) {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const config = getSsoConfig();
    const handleError = useCallback((message) => {
        setError(message);
        onError?.(message);
    }, [onError]);
    const translate = t ?? ((key) => defaultTexts[key] ?? key);
    const resolvedLogo = logo ?? config.appLogo;
    const resolvedTitle = title ?? config.appTitle ?? translate('recover.title');
    const resolvedTheme = theme ?? (config.themeMode
        ? createTheme({ palette: { mode: config.themeMode } })
        : defaultTheme);
    const handleSubmit = useCallback(async () => {
        if (!identifier) {
            handleError(translate('error.fillAllFields'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const config = getSsoConfig();
            const result = await fetchCore({
                url: `${ssoUrl ?? config.ssoUrl}/auth/send_email_recover_password`,
                method: 'POST',
                body: { identifier },
                responseAdapter: config.responseAdapter,
            });
            if (result.success) {
                setSuccess(true);
                onSuccess?.(result.data, '', undefined);
            }
            else {
                handleError(result.message ?? translate('error.recoverFailed'));
            }
        }
        finally {
            setLoading(false);
        }
    }, [identifier, ssoUrl, onSuccess, handleError]);
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
                }, children: [slots?.header ?? (_jsxs(Box, { sx: { textAlign: 'center', mb: 1 }, children: [resolvedLogo && _jsx(Box, { sx: { mb: 1 }, children: resolvedLogo }), _jsx(Typography, { variant: "h5", sx: { fontWeight: "bold" }, children: resolvedTitle })] })), error && _jsx(Alert, { severity: "error", children: error }), success ? (_jsxs(Alert, { severity: "success", children: [translate('recover.success_message'), ' ', _jsx(Link, { href: loginPath, children: translate('recover.back_to_login') })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: translate('recover.subtitle') }), slots?.extraFields, _jsx(TextField, { label: translate('recover.identifier'), value: identifier, onChange: e => setIdentifier(e.target.value), onKeyDown: e => e.key === 'Enter' && handleSubmit(), fullWidth: true, autoComplete: "username" }), _jsx(Button, { variant: "contained", fullWidth: true, onClick: handleSubmit, disabled: loading, size: "large", children: loading ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : translate('recover.send_instructions') }), _jsx(Typography, { variant: "body2", sx: { textAlign: "center" }, children: _jsx(Link, { href: loginPath, children: translate('recover.back_to_login') }) })] })), slots?.footer] }) }) }));
}
