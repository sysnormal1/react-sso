// src/sso/socialCallback.ts

import { SocialProvider } from './authService.js';

/**
 * Chaves que o LoginScreen grava antes de mandar a pessoa ao provedor, e que o
 * retorno lê. Quem grava e quem lê é a própria biblioteca: o front não precisa
 * saber delas.
 */
export const SOCIAL_PROVIDER_KEY = 'sso_social_provider';
export const SOCIAL_REDIRECT_URI_KEY = 'sso_social_redirect_uri';

const PROVIDERS: readonly SocialProvider[] = ['google', 'github'];

/**
 * Parâmetros que Google e GitHub acrescentam ao redirect_uri. Saem da URL depois
 * do retorno: o code vale uma vez só, e deixá-lo ali faria um F5 reenviá-lo.
 */
const OAUTH_RETURN_PARAMS = [
  'code', 'state', 'scope', 'iss', 'authuser', 'prompt', 'hd',
  'error', 'error_description', 'error_uri',
];

export type SocialCallback =
  | { kind: 'code'; provider: SocialProvider; code: string; redirectUri: string }
  | { kind: 'error'; message: string };

export type StoredSocialLogin = {
  provider: string | null;
  redirectUri: string | null;
};

/**
 * Lê o retorno de um login social, se esta página for um.
 *
 * Só é retorno quando há um provedor guardado — foi este front que mandou a
 * pessoa ao provedor. Um `code` na URL sem isso é de outra coisa e fica
 * intocado. Não depende de nenhum parâmetro próprio do front (como o
 * `?origins=` do front-spa): o redirect_uri é dele, e pode ter qualquer forma.
 */
export function readSocialCallback(search: string, stored: StoredSocialLogin): SocialCallback | null {
  if (!stored.provider) {
    return null;
  }
  const params = new URLSearchParams(search);

  // a pessoa recusou a autorização, ou o provedor recusou o pedido
  const error = params.get('error');
  if (error) {
    return { kind: 'error', message: params.get('error_description') ?? error };
  }

  const code = params.get('code');
  if (!code) {
    return null;
  }
  if (!stored.redirectUri || !PROVIDERS.includes(stored.provider as SocialProvider)) {
    return { kind: 'error', message: 'error.invalidParameters' };
  }
  return {
    kind: 'code',
    provider: stored.provider as SocialProvider,
    code,
    redirectUri: stored.redirectUri,
  };
}

/**
 * A mesma URL sem os parâmetros do retorno, relativa à origem, para
 * `history.replaceState`. Os parâmetros do próprio front ficam.
 */
export function withoutOAuthReturnParams(href: string): string {
  const url = new URL(href);
  OAUTH_RETURN_PARAMS.forEach(name => url.searchParams.delete(name));
  return url.pathname + url.search + url.hash;
}
