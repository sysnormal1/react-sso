import { SecureFetchCoreParams } from '../http/secureFetchCore.js';
import { FetchCoreResult } from '../http/fetchCore.js';
export type UseSecureFetchCoreParams<T = unknown> = Omit<SecureFetchCoreParams<T>, 'token' | 'refreshToken' | 'onTokenRefreshed' | 'onRefreshTokenExpired'> & {
    onRefreshTokenExpired?: () => void;
};
export declare function useSecureFetch(): <T = unknown>(params: UseSecureFetchCoreParams<T>) => Promise<FetchCoreResult<T>>;
//# sourceMappingURL=useSecureFetch.d.ts.map