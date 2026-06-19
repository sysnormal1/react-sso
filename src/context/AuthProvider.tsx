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
import { createTheme, PaletteMode, Theme } from '@mui/material';
import { SocialLoginConfig } from '../screens/types.js';
import { setAuthSnapshot } from './AuthStore.js';


export type StorageType = 'localStorage' | 'sessionStorage' | 'none';

export type AuthProviderProps<TAgent = unknown> = {
  children: ReactNode;
  loginPage?: ReactNode;
  registerPage?: ReactNode;
  recoverPage?: ReactNode;
  storage?: StorageType;
  loginPath?: string;
  registerPath?: string;
  recoverPath?: string;
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
  storage = 'localStorage',
  loginPath = '/auth/login',
  registerPath = '/auth/register',
  recoverPath = '/auth/recover',
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

  const renderContent = (): ReactNode => {
    if (logged || isPublic) return children;
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
    return loginPage ?? <LoginScreen 
      registerPath={registerPath} 
      recoverPath={recoverPath} 
      logo={appLogo}
      title={appTitle}
      theme={appTheme}
      socialLogins={socialLogins}
    />;
};

  return (
    <AuthContext.Provider value={value}>
      {renderContent()}
    </AuthContext.Provider>
  );
}