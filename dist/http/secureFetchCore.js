// src/http/secureFetchCore.ts
import { fetchCore } from './fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';
export async function secureFetchCore(params) {
    const config = getSsoConfig();
    // precedência: por chamada > global > padrão do fetchCore
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
    const result = await fetchCore({
        ...params,
        token: params.token,
        responseAdapter,
    });
    if (!result.success && isExpiredToken(result)) {
        return await handleTokenRefresh(params, responseAdapter);
    }
    return result;
}
async function handleTokenRefresh(params, responseAdapter) {
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
    const { token: newToken, refreshToken: newRefreshToken } = refreshResult.data;
    // notifica o AuthProvider para atualizar o estado React
    params.onTokenRefreshed?.(newToken, newRefreshToken);
    // retry único com o novo token — sem recursão
    return await fetchCore({
        ...params,
        token: newToken,
        responseAdapter,
    });
}
function isExpiredToken(result) {
    const message = (result.message ?? '').trim().toLowerCase();
    return (result.status === 401 ||
        message.includes('expired') ||
        message.includes('invalid signature'));
}
