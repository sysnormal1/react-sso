import { FetchCoreParams, FetchCoreResult, ResponseAdapter } from './fetchCore.js';
export type SecureFetchCoreParams<T = unknown> = Omit<FetchCoreParams<T>, 'token'> & {
    token?: string;
    refreshToken?: string;
    refreshUrl?: string;
    responseAdapter?: ResponseAdapter<T>;
    onTokenRefreshed?: (newToken: string, newRefreshToken: string) => void;
    onRefreshTokenExpired?: () => void;
};
export declare function secureFetchCore<T = unknown>(params: SecureFetchCoreParams<T>): Promise<FetchCoreResult<T>>;
//# sourceMappingURL=secureFetchCore.d.ts.map