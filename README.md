# pnk-app

Mobile app (Android) and PWA of **PANENKA Booking**, built with **Ionic 9 + Angular 22 + Capacitor 8**.
Players check availability of the PANENKA synthetic soccer fields (Neiva), book a slot, pay the deposit
and see their bookings offline.

| | |
|---|---|
| Documentation hub | [pnk-docs](https://github.com/AndresGalindo2227/pnk-docs) |
| Architecture | [`01-architecture`](https://github.com/AndresGalindo2227/pnk-docs/tree/main/01-architecture) — feature-first, `presentation → domain ← data` |
| API contract | [`openapi.yaml`](https://github.com/AndresGalindo2227/pnk-docs/blob/main/03-api-and-data/openapi.yaml) |
| Prototype | [Figma](https://www.figma.com/design/4C3gBF0ZdMGqSPzqIZjiG6) |
| Backlog | [GitHub Project](https://github.com/users/AndresGalindo2227/projects/5) |

## Requirements

Node.js 24+, npm, Ionic CLI 7, Android Studio (SDK 36, JDK 21).

## Run locally

```bash
npm install

# 1. Mock API generated from the OpenAPI contract (in a clone of pnk-docs)
npx @stoplight/prism-cli mock 03-api-and-data/openapi.yaml

# 2. App in the browser
ionic serve
```

The development API URL is set in `src/environments/environment.ts`.

## Android

```bash
ionic build
npx cap add android     # first time only
npx cap sync android
npx cap open android    # run on emulator or device from Android Studio
```

## Quality

```bash
npm run lint        # ESLint (layer rule included) + Prettier
npm run test:unit   # Vitest
```

## Project structure

```
src/app/
├── app.config.ts      providers and HTTP interceptors
├── app.routes.ts      single route table with guards
├── core/              i18n, network, session, storage, shell (tab bar)
└── features/
    ├── auth/          HU-01, HU-02  (presentation · domain · data)
    ├── bookings/      HU-03, HU-04, HU-06, HU-07
    ├── my-bookings/   HU-05
    └── payments/      HU-09, HU-10
```

## Branches

`develop` → `qa` → `main`, promoted with cherry-pick pull requests and squash merge
([git-conventions.md](https://github.com/AndresGalindo2227/pnk-docs/blob/main/00-governance/git-conventions.md)).
