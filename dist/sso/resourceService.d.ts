import { FetchCoreResult, ResponseAdapter } from '../http/fetchCore.js';
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
export declare function getAllowedResources(params: GetAllowedResourcesParams): Promise<FetchCoreResult<ResourcePermissionData[]>>;
export declare function getResourcePermission(params: GetResourcePermissionParams): Promise<FetchCoreResult<ResourcePermissionData[]>>;
//# sourceMappingURL=resourceService.d.ts.map