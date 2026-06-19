// src/http/secureFetch.ts

import { secureFetchCore, SecureFetchCoreParams } from './secureFetchCore.js';
import { FetchCoreResult } from './fetchCore.js';
import { getAuthSnapshot } from '../context/AuthStore.js';

export type SecureFetchParams<T = unknown> = Omit<SecureFetchCoreParams<T>,
  'token' | 'refreshToken' | 'onTokenRefreshed' | 'onRefreshTokenExpired'
> & {
  onRefreshTokenExpired?: () => void;
};

export async function secureFetch<T = unknown>(
  params: SecureFetchParams<T>
): Promise<FetchCoreResult<T>> {
  const { token, refreshToken, onTokenRefreshed, logout } = getAuthSnapshot();

  return secureFetchCore<T>({
    ...params,
    token: token ?? undefined,
    refreshToken: refreshToken ?? undefined,
    onTokenRefreshed,
    onRefreshTokenExpired: params.onRefreshTokenExpired ?? logout,
  });
}