---
description: Code rules for the e2e container of My-Investor (ab-java-react)
paths: ["e2e/**"]
---
# E2E code rules — My-Investor (ab-java-react)

## Summary

Playwright Page-Object Model in strict TypeScript. Page objects own locators and navigation; spec files own assertions and route interception. The dominant principle: no raw selectors in tests — every locator lives in a Page Object accessed via `data-testid` attributes.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Spec files | `{feature}.spec.ts` in `tests/` | `health.spec.ts` |
| Page Objects | `{Feature}Page.ts` in `pages/` | `HealthPage.ts` |
| Page Object class | PascalCase matching file name | `HealthPage` |
| `data-testid` values | `{feature}-{element}` kebab-case | `health-status`, `health-loading` |
| Env vars | `E2E_` prefix, `UPPER_SNAKE` | `E2E_BASE_URL`, `E2E_API_URL` |

## Artifact roles

| Role | Structural rule (one line) |
|------|----------------------------|
| `playwright.config.ts` | Single config file; declares `webServer[]` entries, browser projects, env-based URLs, CI vs. local switches |
| Page Object (`pages/*.ts`) | Class with public readonly locators (set in constructor via `getByTestId`) and a `goto()` method; no assertions |
| Spec file (`tests/*.spec.ts`) | Imports one or more Page Objects; owns `test()` blocks, `expect()` assertions, and `page.route()` interceptions |

## Canonical example

> `pages/HealthPage.ts` — the Page Object pattern. Copy its shape.

```typescript
import { type Page, type Locator } from '@playwright/test';

export class HealthPage {
  readonly loading:   Locator;
  readonly error:     Locator;
  readonly status:    Locator;
  readonly database:  Locator;
  readonly uptime:    Locator;
  readonly timestamp: Locator;

  constructor(page: Page) {
    this.loading   = page.getByTestId('health-loading');
    this.error     = page.getByTestId('health-error');
    this.status    = page.getByTestId('health-status');
    this.database  = page.getByTestId('health-database');
    this.uptime    = page.getByTestId('health-uptime');
    this.timestamp = page.getByTestId('health-timestamp');
  }

  async goto(options?: Parameters<Page['goto']>[1]) {
    await page.goto('/', options);
  }
}
```

## Conventions

- **Wiring**: Spec files instantiate Page Objects with `new XxxPage(page)` inside each `test()` block or in `beforeEach`. Page Objects never import each other.
- **Selectors**: Always use `getByTestId()` — never CSS selectors, XPath, or text queries — so tests survive UI copy changes.
- **Route interception**: Use `page.route()` inside spec files to mock error scenarios; never in Page Objects.
- **Server bootstrap**: Both servers (`back` and `front`) are declared in `playwright.config.ts` `webServer[]`; tests never start servers themselves.
- **Errors**: Expect `page.goto()` to succeed; network-level failures are tested via `page.route()` abort — not by stopping servers mid-test.
- **Testing**: Cover at least four scenarios per feature — happy path, loading state, domain error (e.g., 503), and network failure (abort). Mirror the four tests in `health.spec.ts`.
- **Avoid**:
  - Raw CSS or attribute selectors in specs — they break silently when markup changes.
  - Assertions inside Page Objects — they belong in spec files.
  - Hard-coding `localhost:8080` or `localhost:5173` in tests — always read from `E2E_API_URL` / `E2E_BASE_URL` via config.
  - Skipping the loading-state test — it requires a delayed route mock, but it is essential UX coverage.
