// src/context/AuthStore.ts
let snapshot = {
    token: null,
    refreshToken: null,
    onTokenRefreshed: () => { },
    logout: () => { },
};
export function setAuthSnapshot(next) {
    snapshot = next;
}
export function getAuthSnapshot() {
    return snapshot;
}
