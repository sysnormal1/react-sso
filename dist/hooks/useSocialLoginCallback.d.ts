export type UseSocialLoginCallbackResult = {
    loading: boolean;
    error: string | null;
};
/**
 * @deprecated O AuthProvider já troca o code do provedor pelo token, sem o
 * front fazer nada. Não use junto com ele: o code vale uma vez só, e as duas
 * trocas disputariam o mesmo code.
 */
export declare function useSocialLoginCallback(ssoUrl?: string): UseSocialLoginCallbackResult;
//# sourceMappingURL=useSocialLoginCallback.d.ts.map