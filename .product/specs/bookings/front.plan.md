---
plan-type: spec
container: front
---
# spec - bookings - front

## Specification

The `front` container must let operators manage bookings for rocket launches:
- A bookings section shows all bookings for a selected launch (name, email, phone, status)
- An inline form lets the operator create a new booking with all three passenger fields (client-side validation before submit)
- Each active booking has a cancel action; the status updates immediately in the list
- Cancelled bookings are visually distinct from active ones

**Context**: [spec.md](./spec.md)
**Architecture**: [front.arch.md](../../arch/front.arch.md)

### Data model

New types in `front/src/shared/types/bookings.ts`:

```typescript
type BookingStatus = 'created' | 'cancelled'
interface Booking        { id: string; launchId: string; passengerName: string; passengerEmail: string; passengerPhone: string; status: BookingStatus }
interface BookingRequest { passengerName: string; passengerEmail: string; passengerPhone: string }
```

## Implementation Steps

### Step 1: Add shared types
Define the `Booking`, `BookingRequest`, and `BookingStatus` types alongside the existing shared types.
- Paths:
    - `front/src/shared/types/bookings.ts`
- [ ] Create `bookings.ts` with `BookingStatus`, `Booking`, and `BookingRequest` matching the shapes above.

### Step 2: Add `bookingsApi.ts`
Typed HTTP client calls following the same pattern as `launchesApi.ts`.
- Paths:
    - `front/src/features/bookings/bookingsApi.ts`
- [ ] `getBookingsByLaunch(launchId: string): Promise<Booking[]>` → `GET /api/launches/{launchId}/bookings`.
- [ ] `createBooking(launchId: string, req: BookingRequest): Promise<Booking>` → `POST /api/launches/{launchId}/bookings`.
- [ ] `cancelBooking(id: string): Promise<Booking>` → `PATCH /api/bookings/{id}/cancel`.

### Step 3: Add `useBookings` hook
Manages the bookings list for a given launch and exposes create/cancel actions. Follows the same pattern as `useLaunches.ts`.
- Paths:
    - `front/src/features/bookings/useBookings.ts`
- [ ] Accept `launchId: string | null` as input; fetch bookings when `launchId` changes.
- [ ] Expose `bookings: Booking[]`, `create(req: BookingRequest): Promise<void>`, `cancel(id: string): Promise<void>`, `loading: boolean`, `error: string | null`.
- [ ] After create or cancel, refresh the bookings list.

### Step 4: Add `BookingForm` component
Inline form for creating a new booking; validates all three fields before submitting.
- Paths:
    - `front/src/features/bookings/BookingForm.tsx`
    - `front/src/features/bookings/BookingForm.css`
- [ ] Render inputs for `passengerName`, `passengerEmail`, `passengerPhone`, each with `required`.
- [ ] Disable the submit button when any field is empty.
- [ ] On submit call `onSubmit(BookingRequest)` prop and clear the form.
- [ ] Add `data-testid` attributes: `booking-form`, `booking-name`, `booking-email`, `booking-phone`, `booking-submit`.

### Step 5: Add `BookingList` component
Renders the bookings for a launch; provides a cancel action for active bookings and visual distinction for cancelled ones.
- Paths:
    - `front/src/features/bookings/BookingList.tsx`
    - `front/src/features/bookings/BookingList.css`
- [ ] Render each booking row with passenger name, email, phone, and a status badge.
- [ ] Show a "Cancel" button only when `status === 'created'`.
- [ ] Apply a CSS class (e.g. `booking--cancelled`) to rows where `status === 'cancelled'` so they are visually distinct.
- [ ] Add `data-testid="booking-list"` on the container; `data-testid="booking-item"` on each row; `data-testid="booking-cancel"` on the cancel button; `data-testid="booking-status"` on the status badge.

### Step 6: Add `BookingsFeature` shell and wire into `App`
Compose the form and list into a feature module and render it as a new section on the page.
- Paths:
    - `front/src/features/bookings/BookingsFeature.tsx`
    - `front/src/features/bookings/BookingsFeature.css`
    - `front/src/App.tsx`
- [ ] Create `BookingsFeature`: renders a launch selector (a `<select>` populated from a `launches` prop), `BookingList`, and `BookingForm` for the selected launch.
- [ ] Wire `useBookings` inside `BookingsFeature`.
- [ ] Add `data-testid="bookings-feature"` on the section root.
- [ ] Import and render `<BookingsFeature launches={launches} />` in `App.tsx` after the launches section; pass the `launches` list already fetched by `useLaunches`.
