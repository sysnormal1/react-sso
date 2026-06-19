// src/sso/resourceService.ts

import { useCallback } from 'react';
import { useSecureFetch } from '../hooks/useSecureFetch.js';
import { FetchCoreResult, ResponseAdapter } from '../http/fetchCore.js';
import { getSsoConfig } from '../config/SsoConfig.js';

export type ResourcePermissionData = {
  resourceSystemId: number;
  resourceId: number;
  resourceParentId?: number;
  resourceTypeId: number;
  resourceName: string;
  resourcePath: string;
  resourceIcon?: string;
  resourceNumericOrder?: number;
  resourceShowInMenu?: 0 | 1;
  resourcePermissionId?: number;
  resourcePermissionAccessProfileId?: number;
  resourcePermissionAgentId?: number;
  resourcePermissionAllowedAccess?: 0 | 1;
  resourcePermissionAllowedView?: 0 | 1;
  resourcePermissionAllowedCreate?: 0 | 1;
  resourcePermissionAllowedChange?: 0 | 1;
  resourcePermissionAllowedDelete?: 0 | 1;
  children?: ResourcePermissionData[];
  target?: string;
};

export type GetAllowedResourcesParams = {
  systemId?: number;
  url?: string;
  endpoint?: string;
  responseAdapter?: ResponseAdapter;
  onRefreshTokenExpired?: () => void;
};

export type GetResourcePermissionParams = {
  resourcePath?: string;
  systemId?: number;
  accessProfileId?: number;
  resourceTypeId?: number;
  url?: string;
  endpoint?: string;
  responseAdapter?: ResponseAdapter;
  onRefreshTokenExpired?: () => void;
};

export function useGetAllowedResources() {
  const secureFetchCore = useSecureFetch();

  return useCallback(
    async (
      params: GetAllowedResourcesParams = {}
    ): Promise<FetchCoreResult<ResourcePermissionData[]>> => {
      const config = getSsoConfig();
      const base = params.url ?? config.ssoUrl ?? '';
      const endpoint = params.endpoint ?? config.ssoGetAllowedResourcesEndpoint ?? '';
      const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
        | ResponseAdapter<ResourcePermissionData[]>
        | undefined;

      return secureFetchCore<ResourcePermissionData[]>({
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
    },
    [secureFetchCore]
  );
}

export function useGetResourcePermission() {
  const secureFetchCore = useSecureFetch();

  return useCallback(
    async (
      params: GetResourcePermissionParams = {}
    ): Promise<FetchCoreResult<ResourcePermissionData[]>> => {
      const config = getSsoConfig();
      const base = params.url ?? config.ssoUrl ?? '';
      const endpoint = params.endpoint ?? config.ssoGetResourcePermissionsEndpoint ?? '';
      const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
        | ResponseAdapter<ResourcePermissionData[]>
        | undefined;

      const queryParams: Record<string, unknown> = {};

      if (params.systemId ?? config.ssoThisSystemId)
        queryParams.systemId = params.systemId ?? config.ssoThisSystemId;

      if (params.accessProfileId)
        queryParams.accessProfileId = params.accessProfileId;

      if (params.resourceTypeId)
        queryParams.resourceTypeId = params.resourceTypeId;

      if (params.resourcePath)
        queryParams.resourcePaths = [params.resourcePath];

      return secureFetchCore<ResourcePermissionData[]>({
        url: `${base}${endpoint}`,
        method: 'POST',
        body: { queryParams },
        responseAdapter,
        onRefreshTokenExpired: params.onRefreshTokenExpired,
      });
    },
    [secureFetchCore]
  );
}