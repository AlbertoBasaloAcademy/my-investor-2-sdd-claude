# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [0.2.0] - 2026-06-12

### Added

- Bookings feature: operators can register passenger bookings (name, email, phone) against a launch, list them per launch, and cancel them.
  - `back`: `POST/GET /api/launches/{launchId}/bookings`, `GET /api/bookings/{id}`, `PATCH /api/bookings/{id}/cancel`; bookings start as `created`, cancellation is final (409 on re-cancel), and bookings are never deleted.
  - `db`: new `booking` table with FK to `launch`.
  - `front`: bookings section with launch selector, create form (all passenger fields required), and list with cancel action; cancelled bookings are visually distinct.
  - `e2e`: 8-scenario Playwright suite (`bookings.spec.ts` + `BookingPage.ts`) covering the acceptance criteria.

### Fixed

- CORS configuration now allows the `PATCH` method, unblocking browser-issued status transitions (booking cancel and launch status changes) that previously failed with HTTP 403.

## [0.1.0] - 2026-06-10

### Added

- Baseline `ab-java-react` archetype: rocket fleet management and launch scheduling (Spring Boot API + React SPA + SQLite), health-check endpoint and view, and Playwright e2e suite for the health feature.
