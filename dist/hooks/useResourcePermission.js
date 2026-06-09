// src/hooks/useResourcePermission.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { getResourcePermission, getAllowedResources, } from '../sso/resourceService.js';
export function useResourcePermission(systemId) {
    const { token, refreshToken, onTokenRefreshed, logout } = useAuth();
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
        setLoading(true);
        try {
            const result = await getResourcePermission({
                token: token ?? undefined,
                refreshToken: refreshToken ?? undefined,
                resourcePath,
                systemId,
                onTokenRefreshed,
                onRefreshTokenExpired: logout,
            });
            handleResult(result);
        }
        finally {
            setLoading(false);
        }
    }, [token, refreshToken, systemId, onTokenRefreshed, logout, handleResult]);
    const fetchAllowed = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAllowedResources({
                token: token ?? undefined,
                refreshToken: refreshToken ?? undefined,
                systemId,
                onTokenRefreshed,
                onRefreshTokenExpired: logout,
            });
            handleResult(result);
        }
        finally {
            setLoading(false);
        }
    }, [token, refreshToken, systemId, onTokenRefreshed, logout, handleResult]);
    return { loading, data, error, fetch, fetchAllowed };
}
