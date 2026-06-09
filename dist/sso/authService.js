// src/sso/authService.ts
import { fetchCore } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
export async function login(params) {
    const config = getSsoConfig();
    const base = params.url ?? config.ssoUrl ?? '';
    const endpoint = params.endpoint ?? config.ssoAuthEndpoint ?? '';
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
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
export async function refreshTokenRequest(params) {
    const config = getSsoConfig();
    const base = params.url ?? config.ssoUrl ?? '';
    const endpoint = params.endpoint ?? config.ssoRefreshTokenEndpoint ?? '';
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
    return fetchCore({
        url: `${base}${endpoint}`,
        method: 'POST',
        token: params.token,
        body: { refreshToken: params.refreshToken },
        responseAdapter,
    });
}
export async function getSocialLoginUrl(params) {
    const config = getSsoConfig();
    const base = params.url ?? config.ssoUrl ?? '';
    const endpoint = `/auth/${params.provider}/get_login_url`;
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
    return await fetchCore({
        url: `${base}${endpoint}`,
        method: 'POST',
        body: { redirectUri: params.redirectUri },
        responseAdapter,
    });
}
export async function handleSocialCode(params) {
    const config = getSsoConfig();
    const base = params.url ?? config.ssoUrl ?? '';
    const endpoint = `/auth/${params.provider}/handle_code`;
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
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
