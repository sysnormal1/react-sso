// src/index.ts
// config
export { ssoConfig, getSsoConfig } from './config/SsoConfig.js';
// http
export { fetchCore } from './http/fetchCore.js';
export { secureFetchCore } from './http/secureFetchCore.js';
export { secureFetch } from './http/secureFetch.js';
export { useSecureFetch } from './hooks/useSecureFetch.js';
// adapters
export { defaultDataSwapAdapter } from './adapters/defaultDataSwapAdapter.js';
export { useGetAllowedResources, useGetResourcePermission } from './sso/resourceService.js';
// utils
export { flatToNestedArray } from './utils/flatToNestedArray.js';
// context
export { AuthProvider } from './context/AuthProvider.js';
export { useAuth } from './context/AuthContext.js';
// sso
export { login, refreshTokenRequest, getSocialLoginUrl, handleSocialCode } from './sso/authService.js';
export { LoginScreen } from './screens/LoginScreen.js';
export { RegisterScreen } from './screens/RegisterScreen.js';
export { RecoverScreen } from './screens/RecoverScreen.js';
export { useSocialLoginCallback } from './hooks/useSocialLoginCallback.js';
export { UserMenu } from './components/UserMenu.js';
