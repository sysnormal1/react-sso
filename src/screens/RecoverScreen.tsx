// src/screens/RecoverScreen.tsx

import { useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { RecoverScreenProps } from './types.js';

const defaultTexts: Record<string, string> = {
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

export function RecoverScreen({
  logo,
  title = 'Password recover',
  theme = defaultTheme,
  slots,
  ssoUrl,
  loginPath = '/auth/login',
  onSuccess,
  onError,
  t
}: RecoverScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const config = getSsoConfig();

  const handleError = useCallback((message: string) => {
    setError(message);
    onError?.(message);
  }, [onError]);

  const translate = t ?? ((key: string) => defaultTexts[key] ?? key);

  const resolvedLogo = logo ?? config.appLogo;
    const resolvedTitle = title ?? config.appTitle ?? translate('recover.title');
    const resolvedTheme = theme ?? (
        config.themeMode
        ? createTheme({ palette: { mode: config.themeMode } })
        : defaultTheme
    );

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
        onSuccess?.(result.data as any, '', undefined);
      } else {
        handleError(result.message ?? translate('error.recoverFailed'));
      }
    } finally {
      setLoading(false);
    }
  }, [identifier, ssoUrl, onSuccess, handleError]);

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
              <Typography variant="h5" sx={{fontWeight: "bold"}}>
                {resolvedTitle}
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {success ? (
            <Alert severity="success">
              {translate('recover.success_message')}{' '}
              <Link href={loginPath}>{translate('recover.back_to_login')}</Link>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                {translate('recover.subtitle')}
              </Typography>

              {slots?.extraFields}

              <TextField
                label={translate('recover.identifier')}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                fullWidth
                autoComplete="username"
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : translate('recover.send_instructions')}
              </Button>

              <Typography variant="body2" sx={{textAlign: "center"}}>
                <Link href={loginPath}>{translate('recover.back_to_login')}</Link>
              </Typography>
            </>
          )}

          {slots?.footer}
        </Box>
      </Box>
    </ThemeProvider>
  );
}