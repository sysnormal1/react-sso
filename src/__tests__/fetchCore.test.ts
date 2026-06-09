// src/__tests__/fetchCore.test.ts

import { fetchCore } from '../http/fetchCore.js';

const mockFetch = (body: unknown, status = 200) => {
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;
};

describe('fetchCore', () => {
  it('deve retornar success true para resposta 200', async () => {
    mockFetch({ id: 1 });
    const result = await fetchCore({ url: 'http://test.com/api' });
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ id: 1 });
  });

  it('deve retornar success false para resposta 401', async () => {
    mockFetch({ message: 'unauthorized' }, 401);
    const result = await fetchCore({ url: 'http://test.com/api' });
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
  });

  it('deve anexar Authorization header quando token fornecido', async () => {
    let capturedHeaders: Record<string, string> = {};
    globalThis.fetch = async (_url, init) => {
      capturedHeaders = (init?.headers as Record<string, string>) ?? {};
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    };
    await fetchCore({ url: 'http://test.com/api', token: 'abc123' });
    expect(capturedHeaders.Authorization).toBe('Bearer abc123');
  });

  it('deve serializar o body como JSON', async () => {
    let capturedBody: string | null = null;
    globalThis.fetch = async (_url, init) => {
      capturedBody = init?.body as string;
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    };
    await fetchCore({ url: 'http://test.com/api', method: 'POST', body: { x: 1 } });
    expect(capturedBody).toBe(JSON.stringify({ x: 1 }));
  });

  it('deve usar responseAdapter quando fornecido', async () => {
    mockFetch({ success: true, data: { id: 99 }, message: 'ok' });
    const result = await fetchCore({
      url: 'http://test.com/api',
      responseAdapter: (raw: any, status) => ({
        success: raw.success,
        status,
        data: raw.data,
        message: raw.message,
      }),
    });
    expect(result.data).toEqual({ id: 99 });
  });
});