import { FetchCoreParams, FetchCoreResult, ResponseAdapter } from './fetchCore.js';
export type SecureFetchParams<T = unknown> = Omit<FetchCoreParams<T>, 'token'> & {
    token?: string;
    refreshToken?: string;
    refreshUrl?: string;
    responseAdapter?: ResponseAdapter<T>;
    onTokenRefreshed?: (newToken: string, newRefreshToken: string) => void;
    onRefreshTokenExpired?: () => void;
};
export declare function secureFetch<T = unknown>(params: SecureFetchParams<T>): Promise<FetchCoreResult<T>>;
//# sourceMappingURL=secureFetch.d.ts.map