// src/__tests__/secureFetch.test.ts

import { secureFetch } from '../http/secureFetch.js';
import { ssoConfig } from '../config/SsoConfig.js';

ssoConfig({ ssoUrl: 'http://localhost', ssoRefreshTokenEndpoint: '/auth/refresh_token' });

const mockFetch = (...responses: { body: unknown; status: number }[]) => {
  let call = 0;
  globalThis.fetch = async () => {
    const res = responses[call] ?? responses[responses.length - 1];
    call++;
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => res.body,
    } as Response;
  };
};

describe('secureFetch', () => {
  it('deve retornar resultado direto quando token válido', async () => {
    mockFetch({ body: { id: 1 }, status: 200 });
    const result = await secureFetch({ url: 'http://localhost/api', token: 'valid' });
    expect(result.success).toBe(true);
  });

  it('deve tentar refresh e repetir quando token expirado', async () => {
    let tokenRefreshed = false;
    let capturedToken = '';
    let capturedRefresh = '';

    mockFetch(
      { body: { message: 'expired', success: false }, status: 401 },
      { body: { token: 'new-token', refreshToken: 'new-refresh' }, status: 200 },
      { body: { id: 1 }, status: 200 },
    );

    const result = await secureFetch({
      url: 'http://localhost/api',
      token: 'expired-token',
      refreshToken: 'refresh-token',
      onTokenRefreshed: (newToken, newRefreshToken) => {
        tokenRefreshed = true;
        capturedToken = newToken;
        capturedRefresh = newRefreshToken;
      },
    });

    expect(tokenRefreshed).toBe(true);
    expect(capturedToken).toBe('new-token');
    expect(capturedRefresh).toBe('new-refresh');
    expect(result.success).toBe(true);
  });

  it('deve chamar onRefreshTokenExpired quando refresh falha', async () => {
    let expiredCalled = false;

    mockFetch(
      { body: { message: 'expired', success: false }, status: 401 },
      { body: { message: 'expired', success: false }, status: 401 },
    );

    await secureFetch({
      url: 'http://localhost/api',
      token: 'expired-token',
      refreshToken: 'expired-refresh',
      onRefreshTokenExpired: () => { expiredCalled = true; },
    });

    expect(expiredCalled).toBe(true);
  });

  it('deve retornar erro sem tentar refresh quando refreshToken ausente', async () => {
    let expiredCalled = false;

    mockFetch({ body: { message: 'expired' }, status: 401 });

    const result = await secureFetch({
      url: 'http://localhost/api',
      token: 'expired-token',
      onRefreshTokenExpired: () => { expiredCalled = true; },
    });

    expect(expiredCalled).toBe(true);
    expect(result.success).toBe(false);
  });
});