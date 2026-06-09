import { jsx as _jsx } from "react/jsx-runtime";
// src/context/AuthProvider.tsx
import { useCallback, useEffect, useMemo, useState, } from 'react';
import { AuthContext } from './AuthContext.js';
import { LoginScreen } from '../screens/LoginScreen.js';
import { RegisterScreen } from '../screens/RegisterScreen.js';
import { RecoverScreen } from '../screens/RecoverScreen.js';
import { createTheme } from '@mui/material';
function readFromStorage(storage, key) {
    try {
        if (storage === 'localStorage')
            return localStorage.getItem(key);
        if (storage === 'sessionStorage')
            return sessionStorage.getItem(key);
    }
    catch {
        // ambiente sem storage (SSR, testes)
    }
    return null;
}
function writeToStorage(storage, key, value) {
    try {
        if (storage === 'none')
            return;
        const store = storage === 'localStorage' ? localStorage : sessionStorage;
        if (value === null) {
            store.removeItem(key);
        }
        else {
            store.setItem(key, value);
        }
    }
    catch {
        // ambiente sem storage
    }
}
function parseAgent(raw) {
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function AuthProvider({ children, loginPage, registerPage, recoverPage, storage = 'localStorage', loginPath = '/auth/login', registerPath = '/auth/register', recoverPath = '/auth/recover', publicPrefix = '/public', initialToken, initialRefreshToken, initialAgent, appLogo, appTitle, themeMode, socialLogins, }) {
    const [token, setTokenState] = useState(initialToken ?? readFromStorage(storage, 'token'));
    const [refreshToken, setRefreshTokenState] = useState(initialRefreshToken ?? readFromStorage(storage, 'refreshToken'));
    const [agent, setAgentState] = useState(initialAgent ?? parseAgent(readFromStorage(storage, 'agent')));
    // logged é derivado — nunca dessincroniza com token
    const logged = useMemo(() => !!token, [token]);
    const [currentPath, setCurrentPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
    const appTheme = useMemo(() => {
        if (!themeMode)
            return undefined;
        return createTheme({ palette: { mode: themeMode } });
    }, [themeMode]);
    const setToken = useCallback((value) => {
        setTokenState(value);
        writeToStorage(storage, 'token', value);
    }, [storage]);
    const setRefreshToken = useCallback((value) => {
        setRefreshTokenState(value);
        writeToStorage(storage, 'refreshToken', value);
    }, [storage]);
    const setAgent = useCallback((value) => {
        setAgentState(value);
        writeToStorage(storage, 'agent', value ? JSON.stringify(value) : null);
    }, [storage]);
    const login = useCallback((newToken, newRefreshToken, newAgent) => {
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        if (newAgent !== undefined)
            setAgent(newAgent);
    }, [setToken, setRefreshToken, setAgent]);
    const logout = useCallback(() => {
        setToken(null);
        setRefreshToken(null);
        setAgent(null);
    }, [setToken, setRefreshToken, setAgent]);
    // callback estável para o secureFetch atualizar tokens sem acessar React
    const onTokenRefreshed = useCallback((newToken, newRefreshToken) => {
        setToken(newToken);
        setRefreshToken(newRefreshToken);
    }, [setToken, setRefreshToken]);
    const value = useMemo(() => ({
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
    const renderContent = () => {
        if (logged || isPublic)
            return children;
        if (isRegister && registerPage)
            return registerPage;
        if (isRegister)
            return _jsx(RegisterScreen, { loginPath: loginPath, logo: appLogo, title: appTitle, theme: appTheme, socialLogins: socialLogins });
        if (isRecover && recoverPage)
            return recoverPage;
        if (isRecover)
            return _jsx(RecoverScreen, { loginPath: loginPath, logo: appLogo, title: appTitle, theme: appTheme });
        return loginPage ?? _jsx(LoginScreen, { registerPath: registerPath, recoverPath: recoverPath, logo: appLogo, title: appTitle, theme: appTheme, socialLogins: socialLogins });
    };
    return (_jsx(AuthContext.Provider, { value: value, children: renderContent() }));
}
