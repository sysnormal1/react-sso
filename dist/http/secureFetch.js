// src/http/secureFetch.ts
import { secureFetchCore } from './secureFetchCore.js';
import { getAuthSnapshot } from '../context/AuthStore.js';
export async function secureFetch(params) {
    const { token, refreshToken, onTokenRefreshed, logout } = getAuthSnapshot();
    return secureFetchCore({
        ...params,
        token: token ?? undefined,
        refreshToken: refreshToken ?? undefined,
        onTokenRefreshed,
        onRefreshTokenExpired: params.onRefreshTokenExpired ?? logout,
    });
}
