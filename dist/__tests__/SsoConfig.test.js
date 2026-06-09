// src/__tests__/SsoConfig.test.ts
import { ssoConfig, getSsoConfig } from '../config/SsoConfig.js';
describe('SsoConfig', () => {
    it('deve retornar os valores padrão sem configuração', () => {
        const config = getSsoConfig();
        expect(config.ssoUrl).toBe('http://localhost');
        expect(config.ssoAuthEndpoint).toBe('/auth/login');
        expect(config.ssoRefreshTokenEndpoint).toBe('/auth/refresh_token');
    });
    it('deve mesclar configuração fornecida com os padrões', () => {
        ssoConfig({ ssoUrl: 'https://sso.empresa.com', ssoThisSystemId: 5 });
        const config = getSsoConfig();
        expect(config.ssoUrl).toBe('https://sso.empresa.com');
        expect(config.ssoThisSystemId).toBe(5);
        expect(config.ssoAuthEndpoint).toBe('/auth/login');
    });
    it('deve anexar a porta à ssoUrl quando ssoPort é fornecido sem ssoUrl', () => {
        ssoConfig({ ssoPort: 8080 });
        const config = getSsoConfig();
        expect(config.ssoUrl).toContain(':8080');
    });
});
