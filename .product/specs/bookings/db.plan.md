---
plan-type: spec
container: db
---
# spec - bookings - db

## Specification

The `db` container must persist booking records with a foreign-key link to the parent launch. Hibernate's `ddl-auto: update` will create the table automatically when the `Booking` JPA entity is added to the `back` container.

**Context**: [spec.md](./spec.md)
**Architecture**: [db.arch.md](../../arch/db.arch.md)

### Data model

New `booking` table auto-created by Hibernate from the `Booking` entity defined in [back.plan.md](./back.plan.md):

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT (UUID) | PK, Hibernate-generated |
| `launch_id` | TEXT | NOT NULL, FK → `launch.id` |
| `passenger_name` | TEXT | NOT NULL |
| `passenger_email` | TEXT | NOT NULL |
| `passenger_phone` | TEXT | NOT NULL |
| `status` | TEXT | NOT NULL; values: `CREATED`, `CANCELLED` |

## Implementation Steps

### Step 1: Verify schema migration after `Booking` entity is added
Hibernate applies `ddl-auto: update` on startup; the `booking` table must appear in `back/data/app.db` after the first run. No SQL migration scripts are needed.
- Paths:
    - `back/data/app.db`
- [ ] After completing the back-container plan, start the API (`.\mvnw.cmd spring-boot:run` from `back/`).
- [ ] Confirm the `booking` table exists in `back/data/app.db` with all six columns and the FK constraint to `launch`.
- [ ] Confirm a `POST /api/launches/{launchId}/bookings` request persists a row and a subsequent `GET /api/launches/{launchId}/bookings` returns it.
