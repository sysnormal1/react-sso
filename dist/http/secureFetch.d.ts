import { SecureFetchCoreParams } from './secureFetchCore.js';
import { FetchCoreResult } from './fetchCore.js';
export type SecureFetchParams<T = unknown> = Omit<SecureFetchCoreParams<T>, 'token' | 'refreshToken' | 'onTokenRefreshed' | 'onRefreshTokenExpired'> & {
    onRefreshTokenExpired?: () => void;
};
export declare function secureFetch<T = unknown>(params: SecureFetchParams<T>): Promise<FetchCoreResult<T>>;
//# sourceMappingURL=secureFetch.d.ts.map