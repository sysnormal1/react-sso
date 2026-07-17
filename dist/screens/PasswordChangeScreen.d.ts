import { AuthScreenProps } from './types.js';
export type PasswordChangeScreenProps = AuthScreenProps & {
    loginPath?: string;
    ssoUrl?: string;
    token?: string;
};
export declare function PasswordChangeScreen({ logo, title, theme: clientTheme, slots, ssoUrl, loginPath, token: tokenProp, onSuccess, onError, }: PasswordChangeScreenProps): import("react").JSX.Element;
//# sourceMappingURL=PasswordChangeScreen.d.ts.map