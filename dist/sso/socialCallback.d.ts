import { SocialProvider } from './authService.js';
/**
 * Chaves que o LoginScreen grava antes de mandar a pessoa ao provedor, e que o
 * retorno lê. Quem grava e quem lê é a própria biblioteca: o front não precisa
 * saber delas.
 */
export declare const SOCIAL_PROVIDER_KEY = "sso_social_provider";
export declare const SOCIAL_REDIRECT_URI_KEY = "sso_social_redirect_uri";
export type SocialCallback = {
    kind: 'code';
    provider: SocialProvider;
    code: string;
    redirectUri: string;
} | {
    kind: 'error';
    message: string;
};
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
export declare function readSocialCallback(search: string, stored: StoredSocialLogin): SocialCallback | null;
/**
 * A mesma URL sem os parâmetros do retorno, relativa à origem, para
 * `history.replaceState`. Os parâmetros do próprio front ficam.
 */
export declare function withoutOAuthReturnParams(href: string): string;
//# sourceMappingURL=socialCallback.d.ts.map