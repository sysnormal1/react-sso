// src/screens/RegisterScreen.tsx

import { useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { RegisterScreenProps, SocialLoginConfig } from './types.js';
import { getSocialLoginUrl } from '../sso/authService.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';


const defaultTexts: Record<string, string> = {
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

export function RegisterScreen({
  logo,
  title,
  theme: clientTheme,
  slots,
  ssoUrl,
  loginPath = '/auth/login',
  socialLogins = [],
  onSuccess,
  onError
}: RegisterScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const config = getSsoConfig();
  // detecta tema inicial e reage a mudanças do sistema em tempo real
    const [detectedMode, setDetectedMode] = useState(getInitialThemeMode);

  const translate = config.translater ?? ((key: string) => defaultTexts[key] ?? key);

  const resolvedLogo = logo ?? config.appLogo;
  const resolvedTitle = title ?? config.appTitle ?? translate('register.title');
  const resolvedTheme = clientTheme ?? (
    config.themeMode
      ? createTheme({ palette: { mode: config.themeMode } })
      : createTheme({ palette: { mode: detectedMode } })
  );

  useEffect(() => {
    // só escuta se não há tema externo nem config forçando um modo
    if (clientTheme || config.themeMode) return;

    const stored = localStorage?.getItem('drawerLayoutTheme');
    if (stored) return; // usuário já escolheu manualmente

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDetectedMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [clientTheme, config.themeMode]);
  

  const handleError = useCallback((message: string) => {
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
        onSuccess?.(result.data as any, '', undefined);
      } else {
        handleError(result.message ?? 'error.registerFailed');
      }
    } finally {
      setLoading(false);
    }
  }, [identifier, password, confirm, ssoUrl, onSuccess, handleError]);

  const handleSocialLogin = useCallback(async (social: SocialLoginConfig) => {
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
      } finally {
        setSocialLoading(null);
      }
    }, [ssoUrl, handleError]);

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
              <Typography variant="h5" sx={{fontWeight:"bold", color: resolvedTheme.palette.text.primary}}>
                {resolvedTitle}
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{translate(error)}</Alert>}

          {success ? (
            <Alert severity="success">
              {translate('register.success')}{' '}
              <Link href={loginPath}>{translate('register.login')}</Link>
            </Alert>
          ) : (
            <>
              {slots?.extraFields}

              <TextField
                label={translate('register.identifier')}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                fullWidth
                autoComplete="username"
              />

              <TextField
                label={translate('register.password')}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                autoComplete="new-password"
              />

              <TextField
                label={translate('register.confirm_password')}
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                fullWidth
                autoComplete="new-password"
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : translate('register.register')}
              </Button>

              {/* social logins — só renderiza se configurado */}
                {socialLogins && socialLogins.length > 0 && (
                    <>
                    <Divider sx={{color: resolvedTheme.palette.text.primary}}>{translate('register.orWith')}</Divider>
                    {socialLogins.map(social => (
                        <Button
                        key={social.provider}
                        variant="outlined"
                        fullWidth
                        onClick={() => handleSocialLogin(social)}
                        disabled={!!socialLoading}
                        startIcon={
                            socialLoading === social.provider
                            ? <CircularProgress size={18} />
                            : social.icon
                        }
                        >
                        {social.label ?? `${translate('register.socialWith')} ${social.provider}`}
                        </Button>
                    ))}
                    </>
                )}

              <Typography variant="body2" sx={{textAlign: "center", color: resolvedTheme.palette.text.primary}}>
                {translate('register.already_account')}{' '}
                <Link href={loginPath}>{translate('register.login')}</Link>
              </Typography>
            </>
          )}

          {slots?.footer}
        </Box>
      </Box>
    </ThemeProvider>
  );
}