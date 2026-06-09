// src/__tests__/defaultDataSwapAdapter.test.ts

import { defaultDataSwapAdapter } from '../adapters/defaultDataSwapAdapter.js';

describe('defaultDataSwapAdapter', () => {
  it('deve mapear success, data e message corretamente', () => {
    const result = defaultDataSwapAdapter(
      { success: true, data: { id: 1 }, message: 'ok' },
      200
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1 });
    expect(result.message).toBe('ok');
    expect(result.status).toBe(200);
  });

  it('deve usar httpStatus para derivar success quando ausente no body', () => {
    const result = defaultDataSwapAdapter({}, 200);
    expect(result.success).toBe(true);

    const resultFail = defaultDataSwapAdapter({}, 500);
    expect(resultFail.success).toBe(false);
  });

  it('deve retornar success false quando body indica falha', () => {
    const result = defaultDataSwapAdapter({ success: false, message: 'erro' }, 200);
    expect(result.success).toBe(false);
    expect(result.message).toBe('erro');
  });
});