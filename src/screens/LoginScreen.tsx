// src/screens/LoginScreen.tsx

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.js';
import { login, getSocialLoginUrl, handleSocialCode } from '../sso/authService.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { LoginScreenProps, SocialLoginConfig } from './types.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';



const defaultTexts: Record<string, string> = {
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

export function LoginScreen({
  logo,
  title,
  theme: clientTheme,
  slots,
  ssoUrl,
  socialLogins,
  registerPath = '/auth/register',
  recoverPath = '/auth/recover',
  onSuccess,
  onError
}: LoginScreenProps) {
  const { login: authLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const config = getSsoConfig();

  // detecta tema inicial e reage a mudanças do sistema em tempo real
  const [detectedMode, setDetectedMode] = useState(getInitialThemeMode);

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
      } else {
        handleError(result.message ?? 'error.authFailed');
      }
    } finally {
      setLoading(false);
    }
  }, [identifier, password, ssoUrl, authLogin, onSuccess, handleError]);

  

  const translate = config.translater ?? ((key: string) => defaultTexts[key] ?? key);

    

  const resolvedLogo = logo ?? config.appLogo;
  const resolvedTitle = title ?? config.appTitle ?? translate('login.title');
  const resolvedTheme = clientTheme ?? (
    config.themeMode
      ? createTheme({ palette: { mode: config.themeMode } })
      : createTheme({ palette: { mode: detectedMode } })
  );


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
        handleError(urlResult.message ?? 'error.getSocialUrlFail');
        return;
      }

      // passo 2: salvar provider e redirectUri para usar no retorno
      sessionStorage.setItem('sso_social_provider', social.provider);
      sessionStorage.setItem('sso_social_redirect_uri', social.redirectUri);

      // passo 3: redirecionar
      window.location.href = urlResult.data ;
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
          {/* slot: header ou logo/título padrão */}
          {slots?.header ?? (
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              {resolvedLogo && <Box sx={{ mb: 1 }}>{resolvedLogo}</Box>}
              <Typography variant="h5" sx={{fontWeight: "bold", color: resolvedTheme.palette.text.primary}}>
                {resolvedTitle}
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{translate(error)}</Alert>}

          {/* slot: campos extras antes do formulário */}
          {slots?.extraFields}

          <TextField
            label={translate('login.identifier')}
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            fullWidth
            autoComplete="username"
          />

          <TextField
            label={translate('login.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            fullWidth
            autoComplete="current-password"
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        </InputAdornment>
                    ),
                }
            }}
          />

          <Box sx={{ textAlign: 'right', mt: -1 }}>
            <Link href={recoverPath} variant="body2">
              {translate('login.forgotPassword')}
            </Link>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : translate('login.submit')}
          </Button>

          {/* social logins — só renderiza se configurado */}
          {socialLogins && socialLogins.length > 0 && (
            <>
              <Divider sx={{color: resolvedTheme.palette.text.primary}}>{translate('login.orWith')}</Divider>
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
                  {social.label ?? `${translate('login.socialWith')} ${social.provider}`}
                </Button>
              ))}
            </>
          )}

          {registerPath && (
            <Typography variant="body2" sx={{textAlign: "center", color: resolvedTheme.palette.text.primary}}>
              {translate('login.noAccount')}{' '}
              <Link href={registerPath}>{translate('login.register')}</Link>
            </Typography>
          )}

          {/* slot: footer */}
          {slots?.footer}
        </Box>
      </Box>
    </ThemeProvider>
  );
}