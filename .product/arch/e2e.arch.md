# E2E architecture — My-Investor (ab-java-react)

> Container `e2e` from [`system.arch.md`](./system.arch.md). Tier: `e2e`.

## Overview

The `e2e` container is a Playwright 1.52 + TypeScript test suite that boots the real Spring Boot API and Vite SPA before any test runs, then drives Chromium against the live stack to verify full-stack behaviour. It covers the health feature (happy path, loading state, API error, network failure) and the bookings feature (create, cancel, list, validation, not-found, re-cancel conflict, visual distinction). Page Objects encapsulate locators; test files assert behaviour.

- **Folder**: `e2e/`
- **Archetype**: TypeScript — Playwright
- **Talks to**: `front` (Vite SPA at `localhost:5173` via Chromium), `back` (Spring Boot at `localhost:8080` via route interception)

---

## Components diagram (C4 L3)

```mermaid
C4Component
  title E2E Components

  Container_Boundary(boundary, "e2e") {
    Component(specs, "Test Specs", "Playwright spec files", "Assert behaviour across scenarios (happy path, loading, errors)")
    Component(pages, "Page Objects", "TypeScript classes", "Encapsulate locators and navigation for each UI page")
    Component(config, "playwright.config.ts", "Playwright config", "Declares webServers, browser projects, retries, reporters, and env-based URLs")
  }

  Rel(specs, pages, "uses locators from")
  Rel(specs, config, "governed by")
  Rel(config, front, "boots via npm run dev")
  Rel(config, back, "boots via mvnw spring-boot:run")
```

### Code organization

**Pattern**: Page-Object Model (POM).

```text
e2e/
├── playwright.config.ts     # Boots both servers, sets baseURL, browser, CI behaviour
├── tests/
│   ├── health.spec.ts       # Full-stack tests for the health feature (4 scenarios)
│   └── bookings.spec.ts     # Full-stack tests for the bookings feature (8 scenarios)
├── pages/
│   ├── HealthPage.ts        # Locators and goto() for the health view
│   └── BookingPage.ts       # Locators and goto() for the bookings section
├── tsconfig.json            # ES2022 strict; noEmit (type-check only)
└── package.json             # Scripts: test, test:headed, report, lint
```

### Key contracts

| Contract | Shape | Direction |
|----------|-------|-----------|
| `GET /api/health` (real) | `HealthResponse` JSON → asserted via DOM | consumes (live API) |
| `GET /api/health` (mocked 503) | `{ status: 'DOWN', database: 'DOWN', … }` | intercepts (route mock) |
| `GET /api/health` (aborted) | network abort `'failed'` | intercepts (route mock) |
| `data-testid="health-status"` | text content `"UP"` | asserts |
| `data-testid="health-database"` | text content `"UP"` | asserts |
| `data-testid="health-uptime"` | text matches `/\d+h \d+m \d+s/` | asserts |
| `data-testid="health-timestamp"` | non-empty text | asserts |
| `data-testid="health-loading"` | visible with "probing" text during delay | asserts |
| `data-testid="health-error"` | visible and non-empty on failure | asserts |
| Bookings API (real) | `POST/GET /api/launches/{id}/bookings`, `PATCH /api/bookings/{id}/cancel` → JSON + DOM | consumes (live API) |
| `data-testid="booking-*"` selectors | launch select, form fields, rows, status, cancel button | asserts |

---

## Data Schemas

> `e2e` has no persistence layer. It consumes the live API contracts defined in [`back.arch.md`](./back.arch.md) and the `data-testid` selectors defined by the `front` container.

> last updated: 2026-06-12
