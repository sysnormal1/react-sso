// src/config/SsoConfig.ts
const defaults = {
    ssoProtocol: 'http',
    ssoAddress: 'localhost',
    ssoUrl: 'http://localhost',
    ssoAuthEndpoint: '/auth/login',
    ssoRefreshTokenEndpoint: '/auth/refresh_token',
    ssoRegisterEndpoint: '/auth/register',
    ssoRecordsEndpoint: '/records',
    ssoDomainsEndpoint: '/records/domains',
    ssoAccessProfilesEndpoint: '/records/access_profiles',
    ssoAgentsXAccessProfilesXDomainsEndpoint: '/records/agents_x_access_profiles_x_domains',
    ssoResourcesEndpoint: '/records/resources',
    ssoResourcePermissionsEndpoint: '/records/resource_permissions',
    ssoGetAllowedResourcesEndpoint: '/records/resources/get_alloweds',
    ssoGetResourcePermissionsEndpoint: '/records/resources/get_resource_permissions',
    ssoThisDomainId: undefined,
    ssoResourceTypeScreenId: 10,
    responseAdapter: undefined, // usa comportamento padrão do fetchCore
    translater: undefined,
};
let current = { ...defaults };
export function ssoConfig(params) {
    const merged = { ...current, ...params };
    if (params.ssoPort && !params.ssoUrl) {
        merged.ssoUrl = `${merged.ssoUrl}:${params.ssoPort}`;
    }
    current = Object.freeze(merged);
}
export function getSsoConfig() {
    return current;
}
