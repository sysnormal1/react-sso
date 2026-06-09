// src/http/secureFetch.ts

import { fetchCore, FetchCoreParams, FetchCoreResult, ResponseAdapter } from './fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';

export type SecureFetchParams<T = unknown> = Omit<FetchCoreParams<T>, 'token'> & {
  token?: string;
  refreshToken?: string;
  refreshUrl?: string;
  responseAdapter?: ResponseAdapter<T>;
  onTokenRefreshed?: (newToken: string, newRefreshToken: string) => void;
  onRefreshTokenExpired?: () => void;
};

export async function secureFetch<T = unknown>(
  params: SecureFetchParams<T>
): Promise<FetchCoreResult<T>> {
  const config = getSsoConfig();

  // precedência: por chamada > global > padrão do fetchCore
  const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as ResponseAdapter<T> | undefined;

  const result = await fetchCore<T>({
    ...params,
    token: params.token,
    responseAdapter,
  });

  if (!result.success && isExpiredToken(result)) {
    return await handleTokenRefresh<T>(params, responseAdapter);
  }

  return result;
}

async function handleTokenRefresh<T>(
  params: SecureFetchParams<T>,
  responseAdapter: ResponseAdapter<T> | undefined
): Promise<FetchCoreResult<T>> {
  const config = getSsoConfig();
  const refreshUrl = params.refreshUrl ?? config.ssoRefreshTokenEndpoint;

  // sem refresh token ou url configurada, não há o que fazer
  if (!params.refreshToken || !refreshUrl) {
    params.onRefreshTokenExpired?.();
    return {
      success: false,
      status: 401,
      message: 'Session expired and no refresh token available.',
    };
  }

  const refreshResult = await fetchCore({
    url: `${config.ssoUrl}${refreshUrl}`,
    method: 'POST',
    token: params.token,
    body: { refreshToken: params.refreshToken },
    responseAdapter,
  });

  // refresh token também expirou ou falhou
  if (!refreshResult.success || isExpiredToken(refreshResult)) {
    params.onRefreshTokenExpired?.();
    return {
      success: false,
      status: 401,
      message: 'Refresh token expired. Please log in again.',
    };
  }

  const { token: newToken, refreshToken: newRefreshToken } =
    refreshResult.data as any;

  // notifica o AuthProvider para atualizar o estado React
  params.onTokenRefreshed?.(newToken, newRefreshToken);

  // retry único com o novo token — sem recursão
  return await fetchCore<T>({
    ...params,
    token: newToken,
    responseAdapter,
  });
}

function isExpiredToken(result: FetchCoreResult): boolean {
  const message = (result.message ?? '').trim().toLowerCase();
  return (
    result.status === 401 ||
    message.includes('expired') ||
    message.includes('invalid signature')
  );
}