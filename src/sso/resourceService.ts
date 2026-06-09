// src/sso/resourceService.ts

import { secureFetch } from '../http/secureFetch.js';
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
  token?: string;
  refreshToken?: string;
  systemId?: number;
  url?: string;
  endpoint?: string;
  responseAdapter?: ResponseAdapter;
  onTokenRefreshed?: (newToken: string, newRefreshToken: string) => void;
  onRefreshTokenExpired?: () => void;
};

export type GetResourcePermissionParams = {
  token?: string;
  refreshToken?: string;
  resourcePath?: string;
  systemId?: number;
  accessProfileId?: number;
  resourceTypeId?: number;
  url?: string;
  endpoint?: string;
  responseAdapter?: ResponseAdapter;
  onTokenRefreshed?: (newToken: string, newRefreshToken: string) => void;
  onRefreshTokenExpired?: () => void;
};

export async function getAllowedResources(
  params: GetAllowedResourcesParams
): Promise<FetchCoreResult<ResourcePermissionData[]>> {
  const config = getSsoConfig();
  const base = params.url ?? config.ssoUrl ?? '';
  const endpoint = params.endpoint ?? config.ssoGetAllowedResourcesEndpoint ?? '';
  const responseAdapter = (params.responseAdapter ?? config.responseAdapter) as
    | ResponseAdapter<ResourcePermissionData[]>
    | undefined;

  return await secureFetch<ResourcePermissionData[]>({
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

export async function getResourcePermission(
  params: GetResourcePermissionParams
): Promise<FetchCoreResult<ResourcePermissionData[]>> {
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

  return secureFetch<ResourcePermissionData[]>({
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