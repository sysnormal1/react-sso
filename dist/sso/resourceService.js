// src/sso/resourceService.ts
import { secureFetch } from '../http/secureFetch.js';
import { getSsoConfig } from '../config/SsoConfig.js';
export async function getAllowedResources(params) {
    const config = getSsoConfig();
    const base = params.url ?? config.ssoUrl ?? '';
    const endpoint = params.endpoint ?? config.ssoGetAllowedResourcesEndpoint ?? '';
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
    return await secureFetch({
        url: `${base}${endpoint}`,
        method: 'POST',
        token: params.token,
        refreshToken: params.refreshToken,
        body: {
            queryParams: {
                systemId: params.systemId ?? config.ssoThisSystemId,
                allowedAccess: 1,
            },
        },
        responseAdapter,
        onTokenRefreshed: params.onTokenRefreshed,
        onRefreshTokenExpired: params.onRefreshTokenExpired,
    });
}
export async function getResourcePermission(params) {
    const config = getSsoConfig();
    const base = params.url ?? config.ssoUrl ?? '';
    const endpoint = params.endpoint ?? config.ssoGetResourcePermissionsEndpoint ?? '';
    const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
    const queryParams = {};
    if (params.systemId ?? config.ssoThisSystemId)
        queryParams.systemId = params.systemId ?? config.ssoThisSystemId;
    if (params.accessProfileId)
        queryParams.accessProfileId = params.accessProfileId;
    if (params.resourceTypeId)
        queryParams.resourceTypeId = params.resourceTypeId;
    if (params.resourcePath)
        queryParams.resourcePaths = [params.resourcePath];
    return secureFetch({
        url: `${base}${endpoint}`,
        method: 'POST',
        token: params.token,
        refreshToken: params.refreshToken,
        body: { queryParams },
        responseAdapter,
        onTokenRefreshed: params.onTokenRefreshed,
        onRefreshTokenExpired: params.onRefreshTokenExpired,
    });
}
