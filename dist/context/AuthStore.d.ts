export type AuthSnapshot = {
    token: string | null;
    refreshToken: string | null;
    onTokenRefreshed: (newToken: string, newRefreshToken: string) => void;
    logout: () => void;
};
export declare function setAuthSnapshot(next: AuthSnapshot): void;
export declare function getAuthSnapshot(): AuthSnapshot;
//# sourceMappingURL=AuthStore.d.ts.map