// src/context/AuthContext.ts

import { createContext, useContext } from 'react';

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

export type AuthContextValue<TAgent = unknown> =
  AuthState<TAgent> & AuthActions<TAgent>;

export const AuthContext = createContext<AuthContextValue<any> | null>(null);

export function useAuth<TAgent = unknown>(): AuthContextValue<TAgent> {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx as AuthContextValue<TAgent>;
}