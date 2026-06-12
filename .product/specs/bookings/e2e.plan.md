---
plan-type: e2e
slug: bookings
---
# e2e - bookings

## Scope

Full-stack verification of the bookings feature: creating, listing, and cancelling passenger bookings for rocket launches. Tests drive Chromium against the live Vite SPA and Spring Boot API.

**Context**: [spec.md](./spec.md)

### Acceptance criteria under test
- [x] When a booking is submitted with valid passenger details for an existing launch, it is stored with status `created` and returned to the caller.
- [x] When a booking is cancelled, its status changes to `cancelled` and the change is persisted.
- [x] When bookings are listed for a launch, all bookings (both `created` and `cancelled`) are returned.
- [x] When a booking is requested for a launch that does not exist, the API returns a not-found error.
- [x] When a booking is submitted with any required field missing, the API returns a validation error.
- [x] A cancelled booking cannot be reactivated via the API.
- [x] The front-end booking form validates that name, email, and phone are filled before submitting.
- [x] Cancelled bookings are visually distinct in the bookings list.

## Test Steps

### Step 1: Add `BookingPage` page object
Encapsulate all locators and helper actions for the bookings section.
- Paths:
    - `e2e/pages/BookingPage.ts`
- [x] Arrange: import `Page` from Playwright.
- [x] Act: implement `goto()`, `selectLaunch(launchId)`, `fillForm(name, email, phone)`, `submitForm()`, `cancelBooking(index)`, `getBookingItems()`, `getBookingStatus(index)`.
- [x] Assert: locators use `data-testid` attributes defined in the front-end plan (`booking-form`, `booking-list`, `booking-item`, `booking-status`, `booking-cancel`, `booking-submit`).

### Step 2: Create a booking — happy path
Verifies criterion: booking submitted with valid details is stored with status `created`.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: navigate to the app; ensure at least one launch exists (use the API directly via `request` fixture to `POST /api/rockets` then `POST /api/launches` if needed).
- [x] Act: select the launch in `BookingPage`, fill the form with name, email, phone, and submit.
- [x] Assert: the new booking appears in the list with `data-testid="booking-status"` text `"created"`.

### Step 3: Cancel a booking
Verifies criterion: cancelled booking's status changes to `cancelled` and is persisted after page reload.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: create a booking via the UI (or API).
- [x] Act: click the cancel button on the booking row.
- [x] Assert: `data-testid="booking-status"` for that row shows `"cancelled"`.
- [x] Assert: reload the page; the booking is still visible and still shows `"cancelled"`.

### Step 4: List bookings shows all statuses
Verifies criterion: both `created` and `cancelled` bookings appear in the list.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: create two bookings for the same launch; cancel one.
- [x] Act: view the bookings list for that launch.
- [x] Assert: list contains exactly two items — one with status `"created"` and one with status `"cancelled"`.

### Step 5: Booking for non-existent launch returns 404 (API)
Verifies criterion: API returns a not-found error when the launch does not exist.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: none (no setup needed).
- [x] Act: send `POST /api/launches/non-existent-id/bookings` with valid passenger body via `request` fixture.
- [x] Assert: response status is `404`; body contains an `ErrorResponse.message`.

### Step 6: Missing required field returns 400 (API)
Verifies criterion: API returns a validation error when a required passenger field is missing.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: ensure at least one launch exists.
- [x] Act: send `POST /api/launches/{launchId}/bookings` with `passengerEmail` and `passengerPhone` but omit `passengerName` via `request` fixture.
- [x] Assert: response status is `400`; body contains an `ErrorResponse.message`.

### Step 7: Cannot reactivate a cancelled booking (API)
Verifies additional criterion: a `PATCH /api/bookings/{id}/cancel` on an already-cancelled booking returns 409.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: create and cancel a booking via the API.
- [x] Act: send another `PATCH /api/bookings/{id}/cancel` for the same booking id.
- [x] Assert: response status is `409`; body contains an `ErrorResponse.message`.

### Step 8: Front-end form blocks submit when fields are empty
Verifies additional criterion: the submit button is disabled when any required field is blank.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: navigate to the app and select a launch.
- [x] Act: leave all form fields empty; attempt to click `data-testid="booking-submit"`.
- [x] Assert: `booking-submit` is disabled (no booking is added to the list).
- [x] Act: fill only `passengerName` and attempt to submit.
- [x] Assert: `booking-submit` is still disabled.

### Step 9: Cancelled bookings are visually distinct
Verifies additional criterion: cancelled bookings have a visible CSS distinction in the list.
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [x] Arrange: create a booking and cancel it.
- [x] Act: view the bookings list.
- [x] Assert: the cancelled booking row has the CSS class `booking--cancelled` applied.

## Execution

- [x] Run the e2e suite from `e2e/`: `npm test`.
- [x] Confirm all 9 scenarios pass in Chromium.
- [x] Tear down servers (Playwright's `webServer` config handles this automatically).

## Defects report

- [x] Write `.product/specs/bookings/e2e.report.md` listing each defect found: scenario, expected vs actual, affected container, severity.
- [x] Mark each acceptance criterion `[x]` in `spec.md` when its tests pass, `[ ]` otherwise.
