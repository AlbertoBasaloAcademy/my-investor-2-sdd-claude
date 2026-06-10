---
plan-type: spec
container: back
---
# spec - bookings - back

## Specification

The `back` container must expose a bookings REST API nested under launches:
- Create a booking for a given launch (passenger name, email, phone → stored with status `CREATED`)
- List all bookings for a launch
- Retrieve a single booking by id
- Cancel a booking (status transitions `CREATED → CANCELLED` only)
- Return a 404 when the launch or booking does not exist
- Return a 400 when a required passenger field is missing
- Return a 409 when trying to cancel an already-cancelled booking

**Context**: [spec.md](./spec.md)
**Architecture**: [back.arch.md](../../arch/back.arch.md)

### Data model

New `Booking` entity in the `bookings` package with a `@ManyToOne` FK to `Launch`:

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT (UUID) | PK, Hibernate-generated |
| `launch_id` | TEXT | NOT NULL, FK → `launch.id`, EAGER |
| `passenger_name` | TEXT | NOT NULL |
| `passenger_email` | TEXT | NOT NULL |
| `passenger_phone` | TEXT | NOT NULL |
| `status` | TEXT | NOT NULL; `CREATED` \| `CANCELLED` |

## Implementation Steps

### Step 1: Add `BookingStatus` enum and `Booking` entity
Create the domain objects for the bookings feature. `Booking` owns a `@ManyToOne` to `Launch` (EAGER); `status` maps to the `BookingStatus` enum via `@Enumerated(EnumType.STRING)`.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/BookingStatus.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/Booking.java`
- [ ] Create `BookingStatus` enum with values `CREATED` and `CANCELLED`.
- [ ] Create `Booking` `@Entity` with `@Id @GeneratedValue(strategy = GenerationType.UUID)`, `@ManyToOne(fetch = FetchType.EAGER)` `Launch launch`, `String passengerName`, `String passengerEmail`, `String passengerPhone`, `BookingStatus status`.

### Step 2: Add `BookingRepository`
JPA repository with a finder for all bookings belonging to a launch.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/BookingRepository.java`
- [ ] Create `BookingRepository extends JpaRepository<Booking, String>`.
- [ ] Add `List<Booking> findByLaunchId(String launchId)`.

### Step 3: Add request / response records and error envelope
DTOs for the bookings API surface. `BookingRequest` carries `@NotBlank` constraints on all three passenger fields so Bean Validation rejects incomplete payloads at the controller boundary.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/BookingRequest.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/BookingResponse.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/ErrorResponse.java`
- [ ] Create `BookingRequest` record: `@NotBlank String passengerName`, `@NotBlank String passengerEmail`, `@NotBlank String passengerPhone`.
- [ ] Create `BookingResponse` record: `String id`, `String launchId`, `String passengerName`, `String passengerEmail`, `String passengerPhone`, `String status`.
- [ ] Create `ErrorResponse` record: `String message`.

### Step 4: Add `BookingService`
All business logic lives here; the controller delegates entirely to the service.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/BookingService.java`
- [ ] Inject `BookingRepository` and `LaunchRepository`.
- [ ] `createBooking(String launchId, BookingRequest)`: load launch by id, throw `NoSuchElementException` if absent; persist new `Booking` with `status = CREATED`; return `BookingResponse`.
- [ ] `getBookingsByLaunch(String launchId)`: call `findByLaunchId`; return `List<BookingResponse>`.
- [ ] `getBookingById(String id)`: load booking, throw `NoSuchElementException` if absent; return `BookingResponse`.
- [ ] `cancelBooking(String id)`: load booking; throw `IllegalStateException` if status is already `CANCELLED`; set `status = CANCELLED`; save; return `BookingResponse`.

### Step 5: Add `BookingController`
HTTP mapping and exception routing. Exception handlers translate service exceptions to the correct HTTP status and `ErrorResponse` body.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/bookings/BookingController.java`
- [ ] Annotate with `@RestController`.
- [ ] `POST /api/launches/{launchId}/bookings` — `@Valid BookingRequest` body → 201 `BookingResponse`.
- [ ] `GET /api/launches/{launchId}/bookings` → 200 `List<BookingResponse>`.
- [ ] `GET /api/bookings/{id}` → 200 `BookingResponse`.
- [ ] `PATCH /api/bookings/{id}/cancel` → 200 `BookingResponse`.
- [ ] `@ExceptionHandler(NoSuchElementException.class)` → 404 `ErrorResponse`.
- [ ] `@ExceptionHandler(MethodArgumentNotValidException.class)` → 400 `ErrorResponse`.
- [ ] `@ExceptionHandler(IllegalStateException.class)` → 409 `ErrorResponse`.
