// src/context/AuthProvider.tsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { AuthContext, AuthContextValue } from './AuthContext.js';
import { LoginScreen } from '../screens/LoginScreen.js';
import { RegisterScreen } from '../screens/RegisterScreen.js';
import { RecoverScreen } from '../screens/RecoverScreen.js';
import { Box, CircularProgress, createTheme, PaletteMode, Theme, ThemeProvider, Typography } from '@mui/material';
import { SocialLoginConfig } from '../screens/types.js';
import { setAuthSnapshot } from './AuthStore.js';
import { PasswordChangeScreen } from '../screens/PasswordChangeScreen.js';
import { handleSocialCode } from '../sso/authService.js';
import {
  readSocialCallback,
  SocialCallback,
  SOCIAL_PROVIDER_KEY,
  SOCIAL_REDIRECT_URI_KEY,
  withoutOAuthReturnParams,
} from '../sso/socialCallback.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { getInitialThemeMode } from '../utils/themeUtils.js';


export type StorageType = 'localStorage' | 'sessionStorage' | 'none';

export type AuthProviderProps<TAgent = unknown> = {
  children: ReactNode;
  loginPage?: ReactNode;
  registerPage?: ReactNode;
  recoverPage?: ReactNode;
  passwordChangePage?: ReactNode;
  storage?: StorageType;
  loginPath?: string;
  registerPath?: string;
  recoverPath?: string;
  passwordChangePath?: string,
  publicPrefix?: string;
  initialToken?: string;
  initialRefreshToken?: string;
  initialAgent?: TAgent;
  appLogo?: ReactNode;
  appTitle?: string;
  themeMode?: PaletteMode;
  socialLogins?: SocialLoginConfig[];
};

function readFromStorage(storage: StorageType, key: string): string | null {
  try {
    if (storage === 'localStorage') return localStorage.getItem(key);
    if (storage === 'sessionStorage') return sessionStorage.getItem(key);
  } catch {
    // ambiente sem storage (SSR, testes)
  }
  return null;
}

function writeToStorage(storage: StorageType, key: string, value: string | null): void {
  try {
    if (storage === 'none') return;
    const store = storage === 'localStorage' ? localStorage : sessionStorage;
    if (value === null) {
      store.removeItem(key);
    } else {
      store.setItem(key, value);
    }
  } catch {
    // ambiente sem storage
  }
}

/**
 * Codes já enviados ao SSO nesta página. O code vale uma vez só, e o
 * StrictMode roda o efeito duas vezes em desenvolvimento: sem isto a segunda
 * troca falharia e sobrescreveria o resultado da primeira.
 */
const exchangedCodes = new Set<string>();

/** O retorno do provedor nesta página, se for um — lido antes do primeiro render. */
function detectSocialCallback(): SocialCallback | null {
  try {
    if (typeof window === 'undefined') return null;
    return readSocialCallback(window.location.search, {
      provider: sessionStorage.getItem(SOCIAL_PROVIDER_KEY),
      redirectUri: sessionStorage.getItem(SOCIAL_REDIRECT_URI_KEY),
    });
  } catch {
    // ambiente sem storage
    return null;
  }
}

/** Encerra o login social: tira o provedor guardado e os parâmetros do retorno da URL. */
function finishSocialCallback(): void {
  try {
    sessionStorage.removeItem(SOCIAL_PROVIDER_KEY);
    sessionStorage.removeItem(SOCIAL_REDIRECT_URI_KEY);
    window.history.replaceState(window.history.state, '', withoutOAuthReturnParams(window.location.href));
  } catch {
    // ambiente sem storage ou sem history
  }
}

function parseAgent<TAgent>(raw: string | null): TAgent | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TAgent;
  } catch {
    return null;
  }
}

export function AuthProvider<TAgent = unknown>({
  children,
  loginPage,
  registerPage,
  recoverPage,
  passwordChangePage,
  storage = 'localStorage',
  loginPath = '/auth/login',
  registerPath = '/auth/register',
  recoverPath = '/auth/recover',
  passwordChangePath = '/auth/password_change',
  publicPrefix = '/public',
  initialToken,
  initialRefreshToken,
  initialAgent,
  appLogo,
  appTitle,
  themeMode,
  socialLogins,
}: AuthProviderProps<TAgent>) {
  const [token, setTokenState] = useState<string | null>(
    initialToken ?? readFromStorage(storage, 'token')
  );

  const [refreshToken, setRefreshTokenState] = useState<string | null>(
    initialRefreshToken ?? readFromStorage(storage, 'refreshToken')
  );

  const [agent, setAgentState] = useState<TAgent | null>(
    initialAgent ?? parseAgent<TAgent>(readFromStorage(storage, 'agent'))
  );

  // logged é derivado — nunca dessincroniza com token
  const logged = useMemo(() => !!token, [token]);

  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const appTheme = useMemo((): Theme | undefined => {
    if (!themeMode) return undefined;
    return createTheme({ palette: { mode: themeMode } });
  }, [themeMode]);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    writeToStorage(storage, 'token', value);
  }, [storage]);

  const setRefreshToken = useCallback((value: string | null) => {
    setRefreshTokenState(value);
    writeToStorage(storage, 'refreshToken', value);
  }, [storage]);

  const setAgent = useCallback((value: TAgent | null) => {
    setAgentState(value);
    writeToStorage(storage, 'agent', value ? JSON.stringify(value) : null);
  }, [storage]);

  const login = useCallback((
    newToken: string,
    newRefreshToken: string,
    newAgent?: TAgent
  ) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    if (newAgent !== undefined) setAgent(newAgent);
  }, [setToken, setRefreshToken, setAgent]);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setAgent(null);
  }, [setToken, setRefreshToken, setAgent]);

  // callback estável para o secureFetchCore atualizar tokens sem acessar React
  const onTokenRefreshed = useCallback((
    newToken: string,
    newRefreshToken: string
  ) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  }, [setToken, setRefreshToken]);

  // Retorno do login social: o provedor devolve a pessoa ao redirect_uri com um
  // code, e é aqui que ele vira token. Fica no provider, e não na tela de
  // login, porque um front com loginPage próprio não desenha o LoginScreen —
  // e foi a biblioteca que guardou o provedor antes de sair, então é ela que
  // fecha o fluxo. Lido antes do primeiro render para não piscar a tela de login.
  const [socialCallback] = useState<SocialCallback | null>(() => (token ? null : detectSocialCallback()));
  const [socialPending, setSocialPending] = useState(socialCallback?.kind === 'code');
  const [socialError, setSocialError] = useState<string | null>(
    socialCallback?.kind === 'error' ? socialCallback.message : null
  );

  useEffect(() => {
    if (!socialCallback) return;
    // a URL e o storage saem já, dê certo ou não: o code não serve de novo
    finishSocialCallback();
    if (socialCallback.kind !== 'code' || exchangedCodes.has(socialCallback.code)) return;
    exchangedCodes.add(socialCallback.code);

    (async () => {
      try {
        const result = await handleSocialCode<TAgent>({
          provider: socialCallback.provider,
          code: socialCallback.code,
          redirectUri: socialCallback.redirectUri,
        });
        if (result.success && result.data?.token) {
          login(result.data.token, result.data.refreshToken, result.data.agent);
          // mesmo tratamento do login normal — sai de qualquer rota de auth
          if (window.location.pathname.startsWith('/auth/')) {
            window.location.replace('/');
          }
        } else {
          setSocialError(result.message ?? 'error.socialSignFail');
        }
      } catch {
        setSocialError('error.socialSignFail');
      } finally {
        setSocialPending(false);
      }
    })();
  }, [socialCallback, login]);

  // dentro do componente, após declarar token, refreshToken, onTokenRefreshed, logout
  useEffect(() => {
    setAuthSnapshot({ token, refreshToken, onTokenRefreshed, logout });
  }, [token, refreshToken, onTokenRefreshed, logout]);

  const value: AuthContextValue<TAgent> = useMemo(() => ({
    logged,
    token,
    refreshToken,
    agent,
    login,
    logout,
    onTokenRefreshed,
  }), [logged, token, refreshToken, agent, login, logout, onTokenRefreshed]);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // roteamento de telas sem window.location.href.indexOf
  const isPublic = currentPath.startsWith(publicPrefix);
  const isRegister = currentPath.startsWith(registerPath);
  const isRecover = currentPath.startsWith(recoverPath);
  const isPasswordChange = currentPath.startsWith(passwordChangePath);

  const renderContent = (): ReactNode => {
    if (logged || isPublic) return children;
    if (socialPending) return <SocialCallbackPending theme={appTheme} />;
    if (isRegister && registerPage) return registerPage;
    if (isRegister) return <RegisterScreen 
      loginPath={loginPath} 
      logo={appLogo}
      title={appTitle}
      theme={appTheme}
      socialLogins={socialLogins}
    />;
    if (isRecover && recoverPage) return recoverPage;
    if (isRecover) return <RecoverScreen 
      loginPath={loginPath} 
      logo={appLogo}
      title={appTitle}
      theme={appTheme}
    />;
    if (isPasswordChange && passwordChangePage) return passwordChangePage;
    if (isPasswordChange) return <PasswordChangeScreen 
      loginPath={loginPath} 
      logo={appLogo}
      title={appTitle}
      theme={appTheme}
    />;

    return loginPage ?? <LoginScreen 
      registerPath={registerPath} 
      recoverPath={recoverPath} 
      logo={appLogo}
      title={appTitle}
      theme={appTheme}
      socialLogins={socialLogins}
      initialError={socialError ?? undefined}
    />;
};

  return (
    <AuthContext.Provider value={value}>
      {renderContent()}
    </AuthContext.Provider>
  );
}
/** O que aparece enquanto o code do provedor é trocado pelo token. */
function SocialCallbackPending({ theme }: { theme?: Theme }) {
  const config = getSsoConfig();
  const translate = config.translater ?? ((key: string) => (key === 'login.socialCompleting' ? 'Signing in...' : key));
  const resolvedTheme = theme ?? createTheme({ palette: { mode: config.themeMode ?? getInitialThemeMode() } });
  return (
    <ThemeProvider theme={resolvedTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <CircularProgress />
        <Typography variant="body1">{translate('login.socialCompleting')}</Typography>
      </Box>
    </ThemeProvider>
  );
}
