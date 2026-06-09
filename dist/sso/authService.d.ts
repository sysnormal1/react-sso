import { FetchCoreResult } from '../http/fetchCore.js';
import { ResponseAdapter } from '../config/SsoConfig.js';
export type LoginParams = {
    identifier: string | number;
    password: string | number;
    identifierTypeId?: number;
    url?: string;
    endpoint?: string;
    responseAdapter?: ResponseAdapter;
};
export type LoginResult = {
    token: string;
    refreshToken: string;
    agent?: unknown;
};
export type RefreshTokenParams = {
    token: string;
    refreshToken: string;
    url?: string;
    endpoint?: string;
    responseAdapter?: ResponseAdapter;
};
export type RefreshTokenResult = {
    token: string;
    refreshToken: string;
};
export declare function login<TAgent = unknown>(params: LoginParams): Promise<FetchCoreResult<LoginResult & {
    agent?: TAgent;
}>>;
export declare function refreshTokenRequest(params: RefreshTokenParams): Promise<FetchCoreResult<RefreshTokenResult>>;
export type SocialProvider = 'google' | 'github';
export type GetSocialLoginUrlParams = {
    provider: SocialProvider;
    redirectUri: string;
    url?: string;
    responseAdapter?: ResponseAdapter;
};
export type HandleSocialCodeParams = {
    provider: SocialProvider;
    code: string;
    redirectUri: string;
    url?: string;
    responseAdapter?: ResponseAdapter;
};
export declare function getSocialLoginUrl(params: GetSocialLoginUrlParams): Promise<FetchCoreResult<{
    url: string;
}>>;
export declare function handleSocialCode<TAgent = unknown>(params: HandleSocialCodeParams): Promise<FetchCoreResult<LoginResult & {
    agent?: TAgent;
}>>;
//# sourceMappingURL=authService.d.ts.map