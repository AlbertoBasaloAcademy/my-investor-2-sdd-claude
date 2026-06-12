---
report-type: e2e
slug: bookings
---
# e2e report - bookings

> Suite: `e2e/tests/bookings.spec.ts` (8 scenarios) + `e2e/pages/BookingPage.ts`.
> Run 1: 2026-06-12 — 7 passed / 1 failed (plus 4 pre-existing health tests, all green).

## Defects

### D1 — Cancelling a booking from the UI fails with HTTP 403

- **Scenario**: Cancel a booking (plan Step 3) — `cancels a booking and the cancelled status survives a page reload`.
- **Expected**: Clicking the row's Cancel button transitions the booking to `cancelled`; the status persists after reload.
- **Actual**: The booking stays `created` and the UI shows `Request to /api/bookings/{id}/cancel failed with status 403`.
- **Root cause**: `back/src/main/java/dev/aiddbot/abjavareact/shared/CorsConfig.java` allows only `GET, POST, PUT, DELETE`. The Vite dev proxy forwards the browser's `Origin: http://localhost:5173` header, so Spring CORS-processes the call and rejects the `PATCH` method with 403. Every browser-issued `PATCH` is affected — including the existing `PATCH /api/launches/{id}/status` transition — which is why direct API tests (Playwright `request` fixture sends no `Origin`) pass while the UI fails.
- **Affected container**: `back` (shared CORS configuration).
- **Severity**: High — blocks the "cancel a booking" acceptance criterion end-to-end.
- **Kind**: code bug.
- **Fix applied**: added `"PATCH"` to `allowedMethods` in `CorsConfig`. Minimal one-line change; no plan deviation (the bookings back plan assumed PATCH would be servable).
- **Status**: fixed and verified — Run 2 (2026-06-12) green: 12/12 tests pass (8 bookings + 4 health).

## Environment notes (not feature defects)

- `e2e/playwright.config.ts` spawned the backend with a bare `mvnw.cmd`, which Windows `cmd.exe` no longer resolves from the working directory (`NoDefaultCurrentDirectoryInExePath` is set by Node). Changed to `.\mvnw.cmd` so the suite can boot the API. Affected container: `e2e`; kind: test-infra bug.

## Scenario results

| # | Scenario (plan step) | Run 1 | Run 2 (post-fix) |
|---|----------------------|-------|------------------|
| 2 | Create a booking — happy path | ✅ | ✅ |
| 3 | Cancel a booking (persists after reload) | ❌ D1 | ✅ |
| 4 | List shows created + cancelled | ✅ | ✅ |
| 5 | Booking for non-existent launch → 404 | ✅ | ✅ |
| 6 | Missing required field → 400 | ✅ | ✅ |
| 7 | Re-cancel cancelled booking → 409 | ✅ | ✅ |
| 8 | Form blocks submit on empty/partial fields | ✅ | ✅ |
| 9 | Cancelled bookings visually distinct | ✅ | ✅ |
