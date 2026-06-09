// src/hooks/useResourcePermission.ts

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  getResourcePermission,
  getAllowedResources,
  ResourcePermissionData,
} from '../sso/resourceService.js';
import { FetchCoreResult } from '../http/fetchCore.js';

export type UseResourcePermissionResult = {
  loading: boolean;
  data: ResourcePermissionData[] | null;
  error: string | null;
  fetch: (resourcePath?: string) => Promise<void>;
  fetchAllowed: () => Promise<void>;
};

export function useResourcePermission(
  systemId?: number
): UseResourcePermissionResult {
  const { token, refreshToken, onTokenRefreshed, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResourcePermissionData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback((result: FetchCoreResult<ResourcePermissionData[]>) => {
    if (result.success) {
      setData(result.data ?? null);
      setError(null);
    } else {
      setError(result.message ?? 'Failed to fetch resource permissions.');
      setData(null);
    }
  }, []);

  const fetch = useCallback(async (resourcePath?: string) => {
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
    } finally {
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
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken, systemId, onTokenRefreshed, logout, handleResult]);

  return { loading, data, error, fetch, fetchAllowed };
}