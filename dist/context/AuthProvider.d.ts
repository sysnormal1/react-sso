import { ReactNode } from 'react';
import { PaletteMode } from '@mui/material';
import { SocialLoginConfig } from '../screens/types.js';
export type StorageType = 'localStorage' | 'sessionStorage' | 'none';
export type AuthProviderProps<TAgent = unknown> = {
    children: ReactNode;
    loginPage?: ReactNode;
    registerPage?: ReactNode;
    recoverPage?: ReactNode;
    storage?: StorageType;
    loginPath?: string;
    registerPath?: string;
    recoverPath?: string;
    publicPrefix?: string;
    initialToken?: string;
    initialRefreshToken?: string;
    initialAgent?: TAgent;
    appLogo?: ReactNode;
    appTitle?: string;
    themeMode?: PaletteMode;
    socialLogins?: SocialLoginConfig[];
};
export declare function AuthProvider<TAgent = unknown>({ children, loginPage, registerPage, recoverPage, storage, loginPath, registerPath, recoverPath, publicPrefix, initialToken, initialRefreshToken, initialAgent, appLogo, appTitle, themeMode, socialLogins, }: AuthProviderProps<TAgent>): import("react").JSX.Element;
//# sourceMappingURL=AuthProvider.d.ts.map