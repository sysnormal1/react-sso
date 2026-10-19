import { FetchCoreResult, ResponseAdapter } from '../http/fetchCore.js';
export type ResourcePermissionData = {
    resourceDomainId: number;
    resourceId: number;
    resourceParentId?: number;
    resourceTypeId: number;
    resourceName: string;
    resourcePath: string;
    resourceIcon?: string;
    resourceNumericOrder?: number;
    resourceShowInMenu?: 0 | 1;
    /**
     * What holds for whoever no grant reaches: 1 denies, 0 allows access and view (never create, change or delete).
     * On a resource with 0, the SSO returns it even when no grant applies, with resourcePermissionId null
     * and the flags already filled - a null grant here is access, not the absence of it.
     */
    resourceIsRestricted?: 0 | 1;
    /** Null on an open resource (resourceIsRestricted 0) that no grant reaches. */
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
    domainId?: number;
    url?: string;
    endpoint?: string;
    responseAdapter?: ResponseAdapter;
    onRefreshTokenExpired?: () => void;
};
export type GetResourcePermissionParams = {
    resourcePath?: string;
    domainId?: number;
    accessProfileId?: number;
    resourceTypeId?: number;
    url?: string;
    endpoint?: string;
    responseAdapter?: ResponseAdapter;
    onRefreshTokenExpired?: () => void;
};
export declare function useGetAllowedResources(): (params?: GetAllowedResourcesParams) => Promise<FetchCoreResult<ResourcePermissionData[]>>;
export declare function useGetResourcePermission(): (params?: GetResourcePermissionParams) => Promise<FetchCoreResult<ResourcePermissionData[]>>;
//# sourceMappingURL=resourceService.d.ts.map