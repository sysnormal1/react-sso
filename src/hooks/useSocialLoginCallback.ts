// src/hooks/useSocialLoginCallback.ts

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { handleSocialCode, SocialProvider } from '../sso/authService.js';
import { getSsoConfig } from '../config/SsoConfig.js';

export type UseSocialLoginCallbackResult = {
  loading: boolean;
  error: string | null;
};

// src/hooks/useSocialLoginCallback.ts

export function useSocialLoginCallback(ssoUrl?: string): UseSocialLoginCallbackResult {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const provider = sessionStorage.getItem('sso_social_provider') as SocialProvider | null;
        const redirectUri = sessionStorage.getItem('sso_social_redirect_uri');

        if (!code || !provider || !redirectUri) {
          setError('error.invalidParameters');
          return;
        }

        const config = getSsoConfig();
        const result = await handleSocialCode({
          provider,
          code,
          redirectUri,
          url: ssoUrl ?? config.ssoUrl,
        });

        if (result.success && result.data?.token) {
          sessionStorage.removeItem('sso_social_provider');
          sessionStorage.removeItem('sso_social_redirect_uri');
          login(result.data.token, result.data.refreshToken, result.data.agent);

          // mesmo tratamento do login normal — sai de qualquer rota de auth
          if (window.location.pathname.startsWith('/auth/')) {
            window.location.replace('/');
          }
        } else {
          setError(result.message ?? 'error.socialSignFail');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, error };
}
