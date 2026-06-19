// src/hooks/useResourcePermission.ts
import { useState, useCallback } from 'react';
import { flatToNestedArray } from '../utils/flatToNestedArray.js';
import { getSsoConfig } from '../config/SsoConfig.js';
import { useSecureFetch } from './useSecureFetch.js';
export function useResourcePermission(systemId) {
    const secureFetch = useSecureFetch();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const handleResult = useCallback((result) => {
        if (result.success) {
            setData(result.data ?? null);
            setError(null);
        }
        else {
            setError(result.message ?? 'Failed to fetch resource permissions.');
            setData(null);
        }
    }, []);
    const fetch = useCallback(async (resourcePath) => {
        const config = getSsoConfig();
        setLoading(true);
        try {
            const result = await secureFetch({
                url: `${config.ssoUrl}${config.ssoGetResourcePermissionsEndpoint}`,
                method: 'POST',
                body: {
                    queryParams: {
                        systemId: systemId ?? config.ssoThisSystemId,
                        ...(resourcePath ? { resourcePaths: [resourcePath] } : {}),
                    },
                },
            });
            handleResult(result);
        }
        finally {
            setLoading(false);
        }
    }, [secureFetch, systemId, handleResult]);
    const fetchAllowed = useCallback(async () => {
        const config = getSsoConfig();
        setLoading(true);
        try {
            const result = await secureFetch({
                url: `${config.ssoUrl}${config.ssoGetAllowedResourcesEndpoint}`,
                method: 'POST',
                body: {
                    queryParams: {
                        systemId: systemId ?? config.ssoThisSystemId,
                        allowedAccess: 1,
                    },
                },
            });
            if (result.success && result.data) {
                result.data = flatToNestedArray(result.data, 'resourceId', 'resourceParentId');
            }
            handleResult(result);
        }
        finally {
            setLoading(false);
        }
    }, [secureFetch, systemId, handleResult]);
    return { loading, data, error, fetch, fetchAllowed };
}
