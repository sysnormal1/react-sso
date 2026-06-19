// src/hooks/useSecureFetch.ts

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { secureFetchCore, SecureFetchCoreParams } from '../http/secureFetchCore.js';
import { FetchCoreResult } from '../http/fetchCore.js';

// omite os params que o hook injeta automaticamente do contexto
export type UseSecureFetchCoreParams<T = unknown> = Omit<SecureFetchCoreParams<T>,
  'token' | 'refreshToken' | 'onTokenRefreshed' | 'onRefreshTokenExpired'
> & {
  // permite sobrescrever pontualmente se necessário
  onRefreshTokenExpired?: () => void;
};

export function useSecureFetch() {
  const { token, refreshToken, onTokenRefreshed, logout } = useAuth();

  const fetch = useCallback(
    <T = unknown>(params: UseSecureFetchCoreParams<T>): Promise<FetchCoreResult<T>> => {
      return secureFetchCore<T>({
        ...params,
        token: token ?? undefined,
        refreshToken: refreshToken ?? undefined,
        onTokenRefreshed,
        onRefreshTokenExpired: params.onRefreshTokenExpired ?? logout,
      });
    },
    [token, refreshToken, onTokenRefreshed, logout]
  );

  return fetch;
}