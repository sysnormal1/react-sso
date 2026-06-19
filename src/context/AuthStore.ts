// src/context/AuthStore.ts

export type AuthSnapshot = {
  token: string | null;
  refreshToken: string | null;
  onTokenRefreshed: (newToken: string, newRefreshToken: string) => void;
  logout: () => void;
};

let snapshot: AuthSnapshot = {
  token: null,
  refreshToken: null,
  onTokenRefreshed: () => {},
  logout: () => {},
};

export function setAuthSnapshot(next: AuthSnapshot): void {
  snapshot = next;
}

export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}