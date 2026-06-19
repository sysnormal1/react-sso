// src/sso/resourceService.ts
import { useCallback } from 'react';
import { useSecureFetch } from '../hooks/useSecureFetch.js';
import { getSsoConfig } from '../config/SsoConfig.js';
export function useGetAllowedResources() {
    const secureFetchCore = useSecureFetch();
    return useCallback(async (params = {}) => {
        const config = getSsoConfig();
        const base = params.url ?? config.ssoUrl ?? '';
        const endpoint = params.endpoint ?? config.ssoGetAllowedResourcesEndpoint ?? '';
        const responseAdapter = (params.responseAdapter ?? config.responseAdapter);
        return secureFetchCore({
            url: `${base}${endpoint}`,
            method: 'POST',
            body: {
                queryParams: {
                    systemId: params.systemId ?? config.ssoThisSystemId,
                    allowedAccess: 1,
                },
            },
            responseAdapter,
            onRefreshTokenExpired: params.onRefreshTokenExpired,
        });
    }, [secureFetchCore]);
}
export function useGetResourcePermission() {
    const secureFetchCore = useSecureFetch();
    return useCallback(async (params = {}) => {
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
        return secureFetchCore({
            url: `${base}${endpoint}`,
            method: 'POST',
            body: { queryParams },
            responseAdapter,
            onRefreshTokenExpired: params.onRefreshTokenExpired,
        });
    }, [secureFetchCore]);
}
