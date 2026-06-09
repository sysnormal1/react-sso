// src/hooks/useSocialLoginCallback.ts

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { handleSocialCode, SocialProvider } from '../sso/authService.js';
import { getSsoConfig } from '../config/SsoConfig.js';

export type UseSocialLoginCallbackResult = {
  loading: boolean;
  error: string | null;
};

export function useSocialLoginCallback(
  ssoUrl?: string
): UseSocialLoginCallbackResult {
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
          setError('Parâmetros de callback inválidos.');
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
        } else {
          setError(result.message ?? 'Falha no login social.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, error };
}