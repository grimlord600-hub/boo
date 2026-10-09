# boo-dating

Unofficial TypeScript client for [Boo](https://boo.dating) (`api.prod.boo.dating`) with Firebase email-link auth, automatic ID token refresh, and resource helpers derived from HTTP Toolkit captures.

**Disclaimer:** This is not affiliated with Boo. Use only on accounts you own. API behavior can change without notice.

## Requirements

- Node.js 18+

## Install

```bash
cd boo-node
npm install
npm run build
```

Link locally:

```bash
npm link
```

## Quick start

### 1. Request a magic link

```ts
import { BooClient, FileTokenStore } from "boo-dating";

const client = new BooClient({
  email: "you@example.com",
  debugLogs: true, // [logs] request/response traces
  logErrors: true, // [error] on failures (default)
  tokenStore: new FileTokenStore(".boo-session.json"),
});

await client.requestMagicLink("you@example.com");
// Check email; copy the link without opening it in a browser.
```

### 2. Sign in with the link

```ts
await client.signInWithMagicLink("https://boo-dating-prod.firebaseapp.com/__/auth/links?link=...", {
  initApp: true,
});

// Or:
await client.signInWithMagicLink({
  email: "you@example.com",
  oobCode: "PASTE_OOB_CODE",
});

const feed = await client.user.discover();
```

### 3. Resume a saved session

```ts
const client = new BooClient({
  tokenStore: new FileTokenStore(".boo-session.json"),
});
await client.loadSession();
if (client.isAuthenticated()) {
  await client.user.discover(); // auto-refreshes token if near expiry
}
```

## Logging

| Option        | Prefix   | When |
|---------------|----------|------|
| `debugLogs`   | `[logs]` | Request method, path, status, truncated bodies |
| `logErrors`   | `[error]`| HTTP errors, Firebase/auth failures (default on) |

Tokens are truncated in debug output.

## Token refresh

Before each authenticated API call, if the JWT expires within **60 seconds**, the client calls Firebase:

`POST https://securetoken.googleapis.com/v1/token` with `grant_type=refresh_token`.

On **401**, it refreshes once and retries. See also `restendppoint/boorefresh.py` for a minimal Python equivalent.

## API surface

| Resource       | Accessor          | Examples |
|----------------|-------------------|----------|
| Web (pre-auth) | `client.web`      | `appVisitor`, `isAuthAllowed`, `emailLogin` |
| User           | `client.user`     | `discover`, `initApp`, `sendLike`, `pass`, `profile` |
| Chat           | `client.chat`     | `notMessaged`, `pending`, `sortMessages` |
| Message        | `client.message`  | `getMessages`, `sendMessage`, `seen`, `unsend` |
| Question       | `client.question` | `allQuestions`, `create`, `like`, `putViewData` |
| Comment        | `client.comment`  | `listV2`, `create` |
| Interest       | `client.interest` | `popular`, `byName`, `activeUsers` |
| Group date     | `client.groupDate`| `listGroups`, `getGroup` |
| Profile views  | `client.profileView` | `list`, `profilesIViewed` |
| AI             | `client.ai`       | `social` |
| Pusher         | `client.pusher`   | `channelAuth` |

Generic escape hatch:

```ts
await client.request("GET", "/v1/notification");
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `deviceId` | capture default | Android device id |
| `appsflyerId` | capture default | AppsFlyer id |
| `appVersion` | `1.13.140` | App version string |
| `continueUrl` | `https://boo.dating` | Magic link continue URL |
| `firebaseApiKey` | email-link key | Firebase Web API key |
| `firebaseApiKeyCapture` | APK capture key | Fallback for sign-in |

## Scripts

```bash
node scripts/list-endpoints.mjs   # unique routes in restendppoint capture
npm test
npm run build
```

## Related

Parent folder includes `boo_auth_flow.py` (Python reference for the same auth chain).
