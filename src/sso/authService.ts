// src/sso/authService.ts

import { fetchCore, FetchCoreResult } from '../http/fetchCore.js';
import { getSsoConfig, ResponseAdapter } from '../config/SsoConfig.js';

export type LoginParams = {
  identifier: string | number;
  password: string | number;
  identifierTypeId?: number;
  url?: string;
  endpoint?: string;
  responseAdapter?: ResponseAdapter;
};

export type LoginResult = {
  token: string;
  refreshToken: string;
  agent?: unknown;
};

export type RefreshTokenParams = {
  token: string;
  refreshToken: string;
  url?: string;
  endpoint?: string;
  responseAdapter?: ResponseAdapter;
};

export type RefreshTokenResult = {
  token: string;
  refreshToken: string;
};

export async function login<TAgent = unknown>(
  params: LoginParams
): Promise<FetchCoreResult<LoginResult & { agent?: TAgent }>> {
  const config = getSsoConfig();
  const base = params.url ?? config.ssoUrl ?? '';
  const endpoint = params.endpoint ?? config.ssoAuthEndpoint ?? '';
  const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
    | ResponseAdapter<LoginResult & { agent?: TAgent }>
    | undefined;

  return fetchCore({
    url: `${base}${endpoint}`,
    method: 'POST',
    body: {
      identifierTypeId: params.identifierTypeId,
      identifier: params.identifier,
      password: params.password,
    },
    responseAdapter,
  });
}

export async function refreshTokenRequest(
  params: RefreshTokenParams
): Promise<FetchCoreResult<RefreshTokenResult>> {
  const config = getSsoConfig();
  const base = params.url ?? config.ssoUrl ?? '';
  const endpoint = params.endpoint ?? config.ssoRefreshTokenEndpoint ?? '';
  const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
    | ResponseAdapter<RefreshTokenResult>
    | undefined;

  return fetchCore({
    url: `${base}${endpoint}`,
    method: 'POST',
    token: params.token,
    body: { refreshToken: params.refreshToken },
    responseAdapter,
  });
}

export type SocialProvider = 'google' | 'github';

export type GetSocialLoginUrlParams = {
  provider: SocialProvider;
  redirectUri: string;
  url?: string;
  responseAdapter?: ResponseAdapter;
};

export type HandleSocialCodeParams = {
  provider: SocialProvider;
  code: string;
  redirectUri: string;
  url?: string;
  responseAdapter?: ResponseAdapter;
};

export async function getSocialLoginUrl(
  params: GetSocialLoginUrlParams
): Promise<FetchCoreResult<string>> {
  const config = getSsoConfig();
  const base = params.url ?? config.ssoUrl ?? '';
  const endpoint = `/auth/${params.provider}/get_login_url`;
  const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
    | ResponseAdapter<string>
    | undefined;

  return await fetchCore({
    url: `${base}${endpoint}`,
    method: 'POST',
    body: { redirectUri: params.redirectUri },
    responseAdapter,
  });
}

export async function handleSocialCode<TAgent = unknown>(
  params: HandleSocialCodeParams
): Promise<FetchCoreResult<LoginResult & { agent?: TAgent }>> {
  const config = getSsoConfig();
  const base = params.url ?? config.ssoUrl ?? '';
  const endpoint = `/auth/${params.provider}/handle_code`;
  const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
    | ResponseAdapter<LoginResult & { agent?: TAgent }>
    | undefined;

  return await fetchCore({
    url: `${base}${endpoint}`,
    method: 'POST',
    body: {
      code: params.code,
      redirectUri: params.redirectUri,
    },
    responseAdapter,
  });
}