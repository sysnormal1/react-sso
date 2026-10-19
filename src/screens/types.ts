// src/screens/types.ts

import { ReactNode } from 'react';
import { Theme } from '@mui/material';
import { SocialProvider } from '../sso/authService.js';

export type SocialLoginConfig = {
  provider: SocialProvider;
  redirectUri: string;
  label?: string;
  icon?: ReactNode;
};

export type AuthScreenSlots = {
  header?: ReactNode;
  footer?: ReactNode;
  extraFields?: ReactNode;
};

export type AuthScreenProps = {
  logo?: ReactNode;
  title?: string;
  theme?: Theme;
  slots?: AuthScreenSlots;
  ssoUrl?: string;
  onSuccess?: (token: string, refreshToken: string, agent?: unknown) => void;
  onError?: (message: string) => void;
};

export type LoginScreenProps = AuthScreenProps & {
  socialLogins?: SocialLoginConfig[];
  /** Erro a mostrar ao abrir a tela, como o de um login social que voltou recusado. */
  initialError?: string;
  registerPath?: string;
  recoverPath?: string;
};

export type RegisterScreenProps = AuthScreenProps & {
  loginPath?: string;
  socialLogins?: SocialLoginConfig[];
};

export type RecoverScreenProps = AuthScreenProps & {
  loginPath?: string;
};