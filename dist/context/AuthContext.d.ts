export type AuthState<TAgent = unknown> = {
    logged: boolean;
    token: string | null;
    refreshToken: string | null;
    agent: TAgent | null;
};
export type AuthActions<TAgent = unknown> = {
    login: (token: string, refreshToken: string, agent?: TAgent) => void;
    logout: () => void;
    onTokenRefreshed: (newToken: string, newRefreshToken: string) => void;
};
export type AuthContextValue<TAgent = unknown> = AuthState<TAgent> & AuthActions<TAgent>;
export declare const AuthContext: import("react").Context<AuthContextValue<any> | null>;
export declare function useAuth<TAgent = unknown>(): AuthContextValue<TAgent>;
//# sourceMappingURL=AuthContext.d.ts.map