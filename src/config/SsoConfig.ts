// src/config/SsoConfig.ts

import { ReactNode } from 'react';
import { FetchCoreResult } from '../http/fetchCore.js';
import { PaletteMode } from '@mui/material';

export type ResponseAdapter<T = unknown> = (
  raw: unknown,
  httpStatus: number
) => FetchCoreResult<T>;

export type SsoConfigParams = {
  ssoProtocol?: 'http' | 'https';
  ssoAddress?: string;
  ssoPort?: number;
  ssoUrl?: string;

  ssoAuthEndpoint?: string;
  ssoRefreshTokenEndpoint?: string;
  ssoRegisterEndpoint?: string;

  ssoRecordsEndpoint?: string;
  ssoSystemsEndpoint?: string;
  ssoAccessProfilesEndpoint?: string;
  ssoAgentsXAccessProfilesXSystemsEndpoint?: string;
  ssoResourcesEndpoint?: string;
  ssoResourcePermissionsEndpoint?: string;
  ssoGetAllowedResourcesEndpoint?: string;
  ssoGetResourcePermissionsEndpoint?: string;

  ssoThisSystemId?: number;
  ssoResourceTypeScreenId?: number;

  responseAdapter?: ResponseAdapter;

  appLogo?: ReactNode;
  appTitle?: string;
  themeMode?: PaletteMode;

  translater?: (text: string, options?: any) => string;
};

const defaults: SsoConfigParams = {
  ssoProtocol: 'http',
  ssoAddress: 'localhost',
  ssoUrl: 'http://localhost',

  ssoAuthEndpoint: '/auth/login',
  ssoRefreshTokenEndpoint: '/auth/refresh_token',
  ssoRegisterEndpoint: '/auth/register',

  ssoRecordsEndpoint: '/records',
  ssoSystemsEndpoint: '/records/systems',
  ssoAccessProfilesEndpoint: '/records/access_profiles',
  ssoAgentsXAccessProfilesXSystemsEndpoint: '/records/agents_x_access_profiles_x_systems',
  ssoResourcesEndpoint: '/records/resources',
  ssoResourcePermissionsEndpoint: '/records/resource_permissions',
  ssoGetAllowedResourcesEndpoint: '/records/resources/get_alloweds',
  ssoGetResourcePermissionsEndpoint: '/records/resources/get_resource_permissions',

  ssoThisSystemId: undefined,
  ssoResourceTypeScreenId: 10,
  responseAdapter: undefined, // usa comportamento padrão do fetchCore
  translater: undefined,
};

let current: SsoConfigParams = { ...defaults };

export function ssoConfig(params: SsoConfigParams): void {
  const merged = { ...current, ...params };

  if (params.ssoPort && !params.ssoUrl) {
    merged.ssoUrl = `${merged.ssoUrl}:${params.ssoPort}`;
  }

  current = Object.freeze(merged);
}

export function getSsoConfig(): Readonly<SsoConfigParams> {
  return current;
}