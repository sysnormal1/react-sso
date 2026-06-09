import { ResourcePermissionData } from '../sso/resourceService.js';
export type UseResourcePermissionResult = {
    loading: boolean;
    data: ResourcePermissionData[] | null;
    error: string | null;
    fetch: (resourcePath?: string) => Promise<void>;
    fetchAllowed: () => Promise<void>;
};
export declare function useResourcePermission(systemId?: number): UseResourcePermissionResult;
//# sourceMappingURL=useResourcePermission.d.ts.map