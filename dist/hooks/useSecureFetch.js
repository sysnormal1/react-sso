// src/hooks/useSecureFetch.ts
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { secureFetchCore } from '../http/secureFetchCore.js';
export function useSecureFetch() {
    const { token, refreshToken, onTokenRefreshed, logout } = useAuth();
    const fetch = useCallback((params) => {
        return secureFetchCore({
            ...params,
            token: token ?? undefined,
            refreshToken: refreshToken ?? undefined,
            onTokenRefreshed,
            onRefreshTokenExpired: params.onRefreshTokenExpired ?? logout,
        });
    }, [token, refreshToken, onTokenRefreshed, logout]);
    return fetch;
}
