# @sysnormal/react-sso

[![npm](https://img.shields.io/npm/v/@sysnormal/react-sso)](https://www.npmjs.com/package/@sysnormal/react-sso)
[![GitHub tag](https://img.shields.io/github/v/tag/sysnormal1/react-sso)](https://github.com/sysnormal1/react-sso)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6)
![MUI](https://img.shields.io/badge/MUI-Material%20UI-007FFF)

![AI Assisted](https://img.shields.io/badge/AI-Assisted-blue)


**@sysnormal/react-sso** is a React library that provides a complete authentication integration with the [Sysnormal SSO Server](https://github.com/sysnormal1/sysnormal-spring-boot-starter-sso). It manages tokens, session state, default auth screens, social login, and secure HTTP requests — all with minimal setup.

Designed to work standalone or alongside [@sysnormal/react-drawer-layout](https://github.com/sysnormal1/react-drawer-layout).

---

## 🚀 Main Features

- 🔐 `AuthProvider` — manages token, refresh token, agent state, and localStorage persistence
- 🖥️ Default auth screens — Login, Register, and Recover Password with dark/light theme detection
- 🌍 Social login support — Google and GitHub via OAuth2 (requires [Sysnormal SSO Server](https://github.com/sysnormal1/sysnormal-spring-boot-starter-sso) `1.4.0+`)
- 🔄 Automatic token refresh — transparent retry on expired token with `secureFetch`
- 🪝 Hooks for components — `useAuth`, `useSecureFetch`, `useGetAllowedResources`, `useGetResourcePermission`, `useTopBar`
- 🔧 Function for controllers — `secureFetchAuth` for use outside React components
- 🧩 Generic agent typing — `AuthProvider<TAgent>` for full TypeScript inference
- 🌐 i18n-ready — inject your own `t()` function or use built-in English defaults
- 🎨 Pluggable response adapter — works with any API response format via `responseAdapter`

---

## 📦 Installation

```bash
npm install @sysnormal/react-sso
```

Peer dependencies (must be installed in your project):

```bash
npm install react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled
```

---

## ⚙️ Global Configuration

Call `ssoConfig` once at your app's entry point before rendering:

```ts
import { ssoConfig, defaultDataSwapAdapter } from '@sysnormal/react-sso';

ssoConfig({
  ssoUrl: 'https://your-sso-server.com',
  ssoThisSystemId: 1,
  responseAdapter: defaultDataSwapAdapter, // use if your SSO returns { success, data, message }
});
```

### `ssoConfig` options

| Option | Type | Default | Description |
|---|---|---|---|
| `ssoUrl` | `string` | `http://localhost` | Base URL of the SSO server |
| `ssoAuthEndpoint` | `string` | `/auth/login` | Login endpoint |
| `ssoRefreshTokenEndpoint` | `string` | `/auth/refresh_token` | Token refresh endpoint |
| `ssoRegisterEndpoint` | `string` | `/auth/register` | Registration endpoint |
| `ssoGetAllowedResourcesEndpoint` | `string` | `/records/resources/get_alloweds` | Allowed resources endpoint |
| `ssoGetResourcePermissionsEndpoint` | `string` | `/records/resources/get_resource_permissions` | Resource permissions endpoint |
| `ssoThisSystemId` | `number` | `undefined` | ID of the current system in the SSO |
| `responseAdapter` | `ResponseAdapter` | `undefined` | Custom response parser |
| `appLogo` | `ReactNode` | `undefined` | Logo shown on auth screens |
| `appTitle` | `string` | `undefined` | Title shown on auth screens |
| `themeMode` | `'light' \| 'dark'` | auto-detected | Default theme mode for auth screens |
| `translater` | `(key: string) => string` | built-in English | i18n function for auth screens |

---

## 🔌 AuthProvider

Wrap your app with `AuthProvider`. It controls what is rendered based on authentication state and current route.

```tsx
import { AuthProvider } from '@sysnormal/react-sso';

export default function App() {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  );
}
```

When not authenticated, the built-in `LoginScreen` is shown automatically. When authenticated, `children` is rendered.

### Customizing auth screens

```tsx
<AuthProvider
  loginPage={<MyCustomLoginPage />}       // optional: replace login screen
  registerPage={<MyCustomRegisterPage />} // optional: replace register screen
  recoverPage={<MyCustomRecoverPage />}   // optional: replace recover screen
  appLogo={<img src="/logo.png" />}       // shown on default screens
  appTitle="My System"
  socialLogins={[
    { provider: 'google', redirectUri: 'https://myapp.com/auth/callback' }
  ]}
>
  <MyApp />
</AuthProvider>
```

### `AuthProvider` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `loginPage` | `ReactNode` | built-in `LoginScreen` | Custom login screen |
| `registerPage` | `ReactNode` | built-in `RegisterScreen` | Custom register screen |
| `recoverPage` | `ReactNode` | built-in `RecoverScreen` | Custom recover screen |
| `storage` | `'localStorage' \| 'sessionStorage' \| 'none'` | `'localStorage'` | Token persistence strategy |
| `loginPath` | `string` | `/auth/login` | Path that renders the login screen |
| `registerPath` | `string` | `/auth/register` | Path that renders the register screen |
| `recoverPath` | `string` | `/auth/recover` | Path that renders the recover screen |
| `publicPrefix` | `string` | `/public` | Prefix for routes that bypass auth |
| `appLogo` | `ReactNode` | `undefined` | Logo for default auth screens |
| `appTitle` | `string` | `undefined` | Title for default auth screens |
| `themeMode` | `'light' \| 'dark'` | auto-detected | Theme for default auth screens |
| `socialLogins` | `SocialLoginConfig[]` | `undefined` | Social login providers |

---

## 🪝 Hooks

### `useAuth`

Access the authentication state and actions anywhere inside `AuthProvider`:

```tsx
import { useAuth } from '@sysnormal/react-sso';

function MyComponent() {
  const { logged, token, refreshToken, agent, login, logout, onTokenRefreshed } = useAuth();

  return logged
    ? <button onClick={logout}>Sign out</button>
    : <span>Not logged in</span>;
}
```

You can type the agent for full inference:

```tsx
type MyAgent = { id: number; email: string; name: string };

const { agent } = useAuth<MyAgent>();
// agent.email is typed
```

---

### `useSecureFetch`

Makes authenticated HTTP requests with automatic token injection and refresh. Use inside React components:

```tsx
import { useSecureFetch } from '@sysnormal/react-sso';

function MyComponent() {
  const secureFetch = useSecureFetch();

  const loadData = async () => {
    const result = await secureFetch({
      url: 'https://my-api.com/data',
      method: 'GET',
    });
    console.log(result.data);
  };
}
```

Token, refresh token, and logout-on-expiry are injected automatically — no need to pass them manually.

---

### `secureFetch`

Makes authenticated HTTP requests with automatic token injection and refresh. Use inside and outside React components:

```tsx
import { secureFetch } from '@sysnormal/react-sso';

function MyComponent() {

  const loadData = async () => {
    const result = await secureFetch({
      url: 'https://my-api.com/data',
      method: 'GET',
    });
    console.log(result.data);
  };
}
```
---

### `useGetAllowedResources`

Fetches the resources the logged-in agent is allowed to access:

```tsx
import { useGetAllowedResources } from '@sysnormal/react-sso';

function AppContent() {
  const getAllowedResources = useGetAllowedResources();

  useEffect(() => {
    (async () => {
      const result = await getAllowedResources({ systemId: 1 });
      if (result.success) {
        console.log(result.data); // flat array of ResourcePermissionData
      }
    })();
  }, []);
}
```

Use `flatToNestedArray` to build a tree:

```tsx
import { flatToNestedArray } from '@sysnormal/react-sso';

const nested = flatToNestedArray(result.data, 'resourceId', 'resourceParentId');
```

---

### `useGetResourcePermission`

Checks permissions for a specific resource path:

```tsx
import { useGetResourcePermission } from '@sysnormal/react-sso';

function MyScreen() {
  const getResourcePermission = useGetResourcePermission();

  useEffect(() => {
    (async () => {
      const result = await getResourcePermission({
        resourcePath: '/views/modules/dashboard',
      });
      if (result.success && result.data?.[0]?.resourcePermissionAllowedAccess) {
        // user has access
      }
    })();
  }, []);
}
```

---


## 🖥️ Default Auth Screens

The library ships built-in screens that work out of the box. They auto-detect the system theme (dark/light) and respect the user's manual toggle stored in `localStorage`.

### `LoginScreen`

| Prop | Type | Description |
|---|---|---|
| `logo` | `ReactNode` | Logo displayed above the title |
| `title` | `string` | Screen title |
| `theme` | `Theme` | MUI theme override |
| `socialLogins` | `SocialLoginConfig[]` | Social login providers |
| `registerPath` | `string` | Link to register screen |
| `recoverPath` | `string` | Link to password recovery screen |
| `onSuccess` | `function` | Called after successful login |
| `onError` | `function` | Called on login error |
| `slots` | `AuthScreenSlots` | Override header, footer, or extra fields |
| `t` | `(key: string) => string` | i18n function |

### `RegisterScreen` and `RecoverScreen`

Same props as `LoginScreen` except `socialLogins` is also available on `RegisterScreen` and there is no `recoverPath` on `RecoverScreen`.

---

## 🌍 Social Login

Social login requires the [Sysnormal SSO Server](https://github.com/sysnormal1/sysnormal-spring-boot-starter-sso) with Google (`1.4.0+`) or GitHub (`1.5.0+`) configured.

Configure providers in `AuthProvider` or on the `LoginScreen` directly:

```tsx
<AuthProvider
  socialLogins={[
    {
      provider: 'google',
      redirectUri: 'https://myapp.com/auth/callback',
      label: 'Continue with Google',
      icon: <GoogleIcon />,
    },
    {
      provider: 'github',
      redirectUri: 'https://myapp.com/auth/callback',
      label: 'Continue with GitHub',
      icon: <GitHubIcon />,
    },
  ]}
>
```

On the callback route, use `useSocialLoginCallback`:

```tsx
import { useSocialLoginCallback } from '@sysnormal/react-sso';

function CallbackPage() {
  const { loading, error } = useSocialLoginCallback();

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  return null; // AuthProvider redirects automatically after login
}
```

### OAuth2 Social Login Flow

```text
+----------+          +-----------+          +----------+
|  Frontend |          |  SSO      |          | Google/  |
|           |          |  Server   |          | GitHub   |
+----------+          +-----------+          +----------+
     |                      |                     |
     |-- (1) GET login URL ->|                     |
     |<- (2) URL returned ---|                     |
     |                      |                     |
     |-- (3) Redirect user to provider URL ------->|
     |                      |     (4) User auths --|
     |<- (5) Redirect back with ?code=XYZ ---------|
     |                      |                     |
     |-- (6) Send code to SSO (/auth/*/handle_code)|
     |       -------------->|                     |
     |                      |-- (7) Exchange code >|
     |                      |<- (8) Token + info --|
     |                      |-- (9) Save user      |
     |<- (10) SSO JWT token-|                     |
     |                      |                     |
```

---

## 🧩 Response Adapter

If your API returns a custom response format, implement `ResponseAdapter`:

```ts
import { ResponseAdapter, FetchCoreResult, ssoConfig } from '@sysnormal/react-sso';

const myAdapter: ResponseAdapter = (raw: any, httpStatus): FetchCoreResult => ({
  success: raw.ok ?? httpStatus < 400,
  status: httpStatus,
  data: raw.result,
  message: raw.errorMessage,
});

ssoConfig({ responseAdapter: myAdapter });
```

The built-in `defaultDataSwapAdapter` is provided for APIs that return `{ success, data, message, exception }` (compatible with `@aalencarv/common-utils` `DefaultDataSwap`).

---

## 👤 UserMenu Component

A ready-to-use avatar button for the top bar that shows the agent's initial and a logout menu:

```tsx
import { UserMenu } from '@sysnormal/react-sso';

// use inside topBarProps.actions of @sysnormal/react-drawer-layout
<RootLayout
  topBarProps={{
    actions: <UserMenu logoutLabel="Sign out" />
  }}
>
```

The `logout()` from `useAuth` is called automatically, clearing all stored tokens and returning to the login screen.

---

## 🔁 Token Refresh Flow

```text
+----------+       +-----------+       +-----------+
| Frontend |       | secureFetch|       |  SSO      |
+----------+       +-----------+       +-----------+
     |                  |                   |
     |-- request ------->|                   |
     |                  |-- fetch with token>|
     |                  |<- 401 expired -----|
     |                  |                   |
     |                  |-- refresh token -->|
     |                  |<- new token -------|
     |                  |                   |
     |                  |-- retry request -->|
     |                  |<- success ---------|
     |<- result ---------|                   |
```

Handled transparently by `secureFetch` and `secureFetchAuth`. If the refresh token is also expired, `logout()` is called automatically.

---

## 🧰 Technologies Used

- **React 18+**
- **TypeScript 5+**
- **MUI (Material UI) 6+**
- **JSON Web Token (JWT)**

---

## 🧬 Clone the repository

```bash
git clone https://github.com/sysnormal1/react-sso.git
cd react-sso
npm install
```

## 🔧 Build

```bash
npm run build
```

## 🧪 Tests

```bash
npm test
```

---

## ⚖️ License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Alencar Velozo**
GitHub: [@aalencarvz1](https://github.com/aalencarvz1)

---

## 🏢 Organization

**Sysnormal**
GitHub: [@sysnormal1](https://github.com/sysnormal1)

---

## Acknowledgements

Parts of this project were developed with the assistance of AI-based tools for code generation, review and documentation.

