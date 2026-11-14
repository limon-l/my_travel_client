# Wanderlust Atlas — Client

Next.js (App Router) front end for Wanderlust Atlas, a travel-booking product with a
public catalogue, an availability-aware request flow, and an operations back office.

The browser never talks to the Express API directly. Every request goes through a
same-origin bridge (`/api/backend/*`) that attaches a short-lived, server-signed
identity token. This removes the previous trust in browser-supplied `userId`,
role, price, duration, and status values.

---

## Table of contents

- [Architecture](#architecture)
- [Pages and routes](#pages-and-routes)
- [Security model](#security-model)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Design system](#design-system)
- [Accessibility notes](#accessibility-notes)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

---

## Architecture

```
Browser
  │  same-origin fetch, no API secret, no user id in the body
  ▼
Next.js server (App Router)
  ├── /api/backend/[...path]   allowlisted proxy; rebuilds request bodies
  ├── src/lib/catalogue.js     server-rendered catalogue loaders
  └── NextAuth (credentials only, JWT session)
        │  HMAC-SHA256 bearer token, 120 s TTL
        ▼
Express API (../my_travel_server)
  ├── verifies the token secret + expiry
  ├── enforces ownership and admin role
  └── MongoDB (unique sparse holdKey per departure)
```

Important properties:

- **Identity is derived, not supplied.** The bridge reads the NextAuth session and
  signs `{ sub, role, name, email, exp }` with `API_SESSION_SECRET`.
- **The API base URL is server-only.** `API_BASE_URL` is never exposed as
  `NEXT_PUBLIC_*`.
- **Allowlist, not open proxy.** Unknown methods/paths return `404 ROUTE_NOT_ALLOWED`.
- **Field whitelists.** Bodies are rebuilt from known fields, so a caller cannot
  inject `userId`, `role`, `status`, `totalPrice`, or timestamps.
- **Self-scope rewriting.** `/bookings/:id` and `/users/:id` are rewritten to the
  signed-in subject before forwarding.
- **Defence in depth.** The Express API independently authenticates, authorises,
  validates, and derives money/duration from the stored tour.

NextAuth uses the credentials provider only. Google OAuth was removed because the
product has no account-linking flow; adding it later requires an explicit identity
linking design.

## Pages and routes

| Route                     | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `/`                       | Landing page and featured catalogue                            |
| `/tours`                  | Public catalogue with availability-aware cards                 |
| `/tours/[id]`             | Tour detail, departure picker, request panel                   |
| `/packages`               | Permanent redirect to `/tours` (legacy URL)                    |
| `/about`, `/contact`      | Static product pages                                           |
| `/login`, `/register`     | Credentials auth                                               |
| `/dashboard`              | Role-aware overview                                            |
| `/dashboard/bookings`     | Customer requests, timeline, withdrawal                        |
| `/dashboard/requests`     | Operations queue and per-tour departure management             |
| `/dashboard/manage`       | Tour inventory                                                 |
| `/dashboard/add`          | Create a tour                                                  |
| `/dashboard/profile`      | Profile details                                                |
| `/api/auth/[...nextauth]` | NextAuth handlers                                              |
| `/api/backend/[...path]`  | Same-origin API bridge                                         |
| `/sitemap.xml`, `/robots.txt` | Generated metadata                                        |

`/dashboard/*` is protected by `src/proxy.js`; the API bridge repeats the check on
the server rather than relying on the proxy alone.

## Security model

Implemented in this repository:

- No public/admin credential is committed or rendered in the UI.
- Admin access requires `role === "admin"` from a backend-verified sign-in, never an
  email heuristic.
- The Express API is the source of truth for price, duration, status transitions,
  and departure availability.
- Only `Pending → Confirmed | Rejected` transitions are accepted; terminal states are
  immutable.
- Withdrawing a request is limited to its owner and to `Pending` bookings.
- Response headers include a CSP, `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, and a restrictive `Permissions-Policy`.
- Remote images must use HTTPS; SVG is disabled in the image optimizer.
- Sign-in and registration failures are shown as generic messages.

Not implemented / out of scope:

- No client-side rate limiting; the API rate-limits sign-in and registration.
- No email verification, password reset, or MFA.
- No account linking for third-party identity providers.

## Local setup

Requirements: Node.js 22 (Node 20.19+ also satisfies Next 16), npm, and a running
instance of the companion API.

```bash
npm install
```

Create `.env.local` in this directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-value

# Origin only, or the legacy value ending in /api (normalised automatically)
API_BASE_URL=http://localhost:5000

# Must be identical to API_SESSION_SECRET in the Express environment.
# Generate: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
API_SESSION_SECRET=replace-with-the-same-secret-as-the-api
```

Then:

```bash
npm run dev
```

Open <http://localhost:3000>.

### Admin access

There are no demo admin credentials. To create an operator locally:

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (bcrypt, cost 12) in the **API**
   environment; see `../my_travel_server/.env.example`.
2. Sign in through `/login` with that email and password. The API returns
   `role: "admin"` only when the credentials match the configured hash.

Never commit `.env`, `.env.local`, or a plaintext admin password.

## Environment variables

| Variable             | Required | Scope        | Notes                                                        |
| -------------------- | -------- | ------------ | ------------------------------------------------------------ |
| `NEXTAUTH_URL`       | Yes      | server       | Public origin of this app, e.g. `http://localhost:3000`.      |
| `NEXTAUTH_SECRET`    | Yes      | server       | NextAuth JWT/session encryption secret.                      |
| `API_BASE_URL`       | Yes      | server only  | Express origin. A trailing `/api` is accepted and stripped.   |
| `API_SESSION_SECRET` | Yes      | server only  | Shared HMAC secret; must match the API exactly (32+ chars).   |
| `NEXT_PUBLIC_API_URL`| Legacy   | server only  | Fallback read by `src/lib/backend.js`; prefer `API_BASE_URL`. |

`API_SESSION_SECRET` is validated by both sides. If it is missing or shorter than 32
characters, private bridge routes fail closed with `503 BRIDGE_NOT_CONFIGURED`.

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Next dev server                       |
| `npm run build`     | Production build                      |
| `npm start`         | Serve the production build            |
| `npm run lint`      | ESLint (Next config)                  |
| `npm test`          | Vitest suite (run once)               |
| `npm run test:watch`| Vitest in watch mode                  |

Windows note: if `npm` is blocked by PowerShell execution policy, use `npm.cmd`.

## Testing

Vitest + jsdom + Testing Library cover the logic that protects money, dates, and
identity:

- `test/dates.test.js` — UTC calendar-date parsing/formatting, past-date guards.
- `test/booking-status.test.js` — status labels and transition rules.
- `test/session-token.test.js` — HMAC signing, tampering, expiry, weak secrets.
- `test/api-client.test.js` — API client error mapping and upstream failures.
- `test/components.test.jsx` — availability, status badge, and request-panel states.

Real database integration and concurrency tests live in the API repository and are
skipped unless `TEST_MONGO_URI` points at a disposable database.

## Design system

Tokens live in `src/app/globals.css`:

| Token          | Value     | Use                                    |
| -------------- | --------- | -------------------------------------- |
| Deep Ocean     | `#0D2933` | Primary text, dark surfaces             |
| Lagoon         | `#1A7776` | Primary action, focus, links           |
| Sand           | `#F4F0E8` | Page background                        |
| Sunset         | `#D99B64` | Accent, highlights                     |

Typography: **Manrope** for UI, **Playfair Display** for display headings. Spacing,
radii, shadows, and control heights are tokenised; UI primitives live in
`src/components/ui/`.

## Accessibility notes

- Target: WCAG 2.2 AA, including visible focus, 44 px minimum touch targets, and
  semantic landmarks.
- A skip link and a single `<main>` landmark are present in the root layout.
- Status is conveyed by text as well as colour.
- `prefers-reduced-motion` disables non-essential transitions and animations.
- Forms use labelled controls and inline error text.

Responsive checks target 320, 375, 768, 1024, 1440, and 1920 px. Browser-based
verification requires a running instance and is not claimed by the unit suite.

## Deployment

Set these in the hosting provider (for example Vercel) for **Production** and
**Preview**:

- `NEXTAUTH_URL` — must be the deployed HTTPS origin, not localhost.
- `NEXTAUTH_SECRET` — unique per environment.
- `API_BASE_URL` — deployed Express origin.
- `API_SESSION_SECRET` — identical to the API's value.

Do not set `NEXT_PUBLIC_API_URL` for new deployments. Do not put `API_SESSION_SECRET`
in any `NEXT_PUBLIC_*` variable.

Deployment, secret provisioning, and credential rotation are owner-approved
operations; this repository does not perform them automatically.

## Known limitations

- The deployed API has been observed returning `500` for `GET /api/tours` while `/`
  returns `200`. Root-cause evidence (Render logs/revision) is not available in this
  workspace, so production readiness is **BLOCKED** until the API is redeployed and
  `/api/health` reports `ok`.
- Local end-to-end tests cannot reach MongoDB from this environment
  (`querySrv ECONNREFUSED`); real-DB booking/concurrency coverage is therefore
  **BLOCKED** locally.
- The audit still reports moderate advisories in the ESLint/TypeScript toolchain
  (`minimatch` via `typescript-eslint`). They are development-time only; the current
  upstream release is affected.
- The image optimizer accepts any HTTPS host because catalogue covers are
  operations-curated and may already point at third-party hosts. Pinning a host
  allowlist would break existing records; revisit once image storage is owned by the
  product.
- No automated visual regression or cross-browser suite is included.
