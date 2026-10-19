// src/__tests__/socialCallback.test.ts

import { readSocialCallback, withoutOAuthReturnParams } from '../sso/socialCallback.js';

const googleReturn = '?origins=google&iss=https://accounts.google.com&code=4/abc&scope=email+profile+openid&authuser=0&prompt=consent';
const stored = { provider: 'google', redirectUri: 'https://portal.example/?origins=google' };

describe('readSocialCallback', () => {
  it('reconhece o retorno do Google com o code e o redirectUri guardado', () => {
    expect(readSocialCallback(googleReturn, stored)).toEqual({
      kind: 'code',
      provider: 'google',
      code: '4/abc',
      redirectUri: 'https://portal.example/?origins=google',
    });
  });

  it('reconhece o retorno do GitHub', () => {
    expect(readSocialCallback('?origins=github&code=xyz', { provider: 'github', redirectUri: 'https://portal.example/?origins=github' }))
      .toMatchObject({ kind: 'code', provider: 'github', code: 'xyz' });
  });

  it('ignora code na URL quando este front não iniciou login social', () => {
    expect(readSocialCallback(googleReturn, { provider: null, redirectUri: null })).toBeNull();
  });

  it('não é retorno quando não há code nem erro', () => {
    expect(readSocialCallback('?origins=google', stored)).toBeNull();
    expect(readSocialCallback('', stored)).toBeNull();
  });

  it('devolve o erro do provedor quando a pessoa recusa', () => {
    expect(readSocialCallback('?error=access_denied&error_description=The+user+has+denied', stored))
      .toEqual({ kind: 'error', message: 'The user has denied' });
    expect(readSocialCallback('?error=access_denied', stored))
      .toEqual({ kind: 'error', message: 'access_denied' });
  });

  it('recusa retorno sem redirectUri guardado ou com provedor desconhecido', () => {
    expect(readSocialCallback(googleReturn, { provider: 'google', redirectUri: null }))
      .toEqual({ kind: 'error', message: 'error.invalidParameters' });
    expect(readSocialCallback(googleReturn, { provider: 'facebook', redirectUri: 'x' }))
      .toEqual({ kind: 'error', message: 'error.invalidParameters' });
  });
});

describe('withoutOAuthReturnParams', () => {
  it('tira os parâmetros do provedor e mantém os do front', () => {
    expect(withoutOAuthReturnParams('https://portal.example:3006/' + googleReturn + '#x'))
      .toBe('/?origins=google#x');
  });

  it('tira os parâmetros de erro', () => {
    expect(withoutOAuthReturnParams('https://portal.example/app?error=access_denied&error_description=no&error_uri=u'))
      .toBe('/app');
  });
});
