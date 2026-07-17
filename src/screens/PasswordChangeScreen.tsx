// src/screens/PasswordChangeScreen.tsx

import { useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { AuthScreenProps } from './types.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';

const defaultTexts: Record<string, string> = {
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

export type PasswordChangeScreenProps = AuthScreenProps & {
  loginPath?: string;
  ssoUrl?: string;
  // token pode vir via prop (quando o app já extrai do path)
  // ou a screen extrai sozinha de window.location.pathname
  token?: string;
};

export function PasswordChangeScreen({
  logo,
  title,
  theme: clientTheme,
  slots,
  ssoUrl,
  loginPath = '/auth/login',
  token: tokenProp,
  onSuccess,
  onError,
}: PasswordChangeScreenProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const config = getSsoConfig();
  const translate = config.translater ?? ((key: string) => defaultTexts[key] ?? key);

  // extrai o token do path /auth/recover/:token se não vier via prop
  const token = tokenProp ?? (() => {
    if (typeof window === 'undefined') return null;
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || null;
  })();

  const [detectedMode, setDetectedMode] = useState(getInitialThemeMode);

  useEffect(() => {
    if (clientTheme || config.themeMode) return;
    const stored = localStorage?.getItem('drawerLayoutTheme');
    if (stored) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDetectedMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [clientTheme, config.themeMode]);

  const resolvedLogo = logo ?? config.appLogo;
  const resolvedTitle = title ?? config.appTitle ?? translate('passwordChange.title');
  const resolvedTheme = clientTheme ?? (
    config.themeMode
      ? createTheme({ palette: { mode: config.themeMode } })
      : createTheme({ palette: { mode: detectedMode } })
  );

  const handleError = useCallback((message: string) => {
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
        onSuccess?.(result.data as any, '', undefined);
      } else {
        handleError(result.message ?? translate('error.passwordChangeFailed'));
      }
    } finally {
      setLoading(false);
    }
  }, [password, confirm, token, ssoUrl, config, handleError, onSuccess, translate]);

  return (
    <ThemeProvider theme={resolvedTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {slots?.header ?? (
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              {resolvedLogo && <Box sx={{ mb: 1 }}>{resolvedLogo}</Box>}
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: resolvedTheme.palette.text.primary }}>
                {resolvedTitle}
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{translate(error)}</Alert>}

          {success ? (
            <>
              <Alert severity="success">
                {translate('passwordChange.success')}
              </Alert>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                <Link href={loginPath}>
                  {translate('passwordChange.backToLogin')}
                </Link>
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: resolvedTheme.palette.text.secondary }}>
                {translate('passwordChange.subtitle')}
              </Typography>

              {slots?.extraFields}

              <TextField
                label={translate('passwordChange.newPassword')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                fullWidth
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label={translate('passwordChange.confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                fullWidth
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(p => !p)} edge="end">
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                size="large"
              >
                {loading
                  ? <CircularProgress size={24} color="inherit" />
                  : translate('passwordChange.submit')
                }
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                <Link href={loginPath}>
                  {translate('passwordChange.backToLogin')}
                </Link>
              </Typography>
            </>
          )}

          {slots?.footer}
        </Box>
      </Box>
    </ThemeProvider>
  );
}