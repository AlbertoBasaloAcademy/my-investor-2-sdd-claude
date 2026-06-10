# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack investment tracking application built as a Spec-Driven Development (SDD) course project. Stack: Spring Boot 3.5 (Java 21) backend + React 19 + TypeScript frontend + Playwright E2E tests. Three independent workspaces (`back/`, `front/`, `e2e/`) share a single git repo.

## Commands

### Backend (`back/`)
```bash
./mvnw spring-boot:run   # Start API server on port 8080
./mvnw test              # Run unit tests
./mvnw clean package     # Build JAR
```

### Frontend (`front/`)
```bash
npm run dev        # Start Vite dev server on port 5173
npm run test       # Run Vitest once
npm run test:watch # Run Vitest in watch mode
npm run lint       # ESLint check
npm run build      # TypeScript compile + Vite production build
```

### E2E (`e2e/`)
```bash
npm run test         # Run Playwright tests (headless)
npm run test:headed  # Run with visible browser
npm run report       # Open last Playwright report
```

## Architecture

### Backend (`back/src/main/java/dev/aiddbot/abjavareact/`)
- `health/` — health-check endpoint
- `shared/` — CORS config, shared utilities

Database: SQLite at `data/app.db` via Hibernate (`ddl-auto: update`). API runs on port 8080 with CORS open to `localhost:5173`.

### Frontend (`front/src/`)
- `features/<name>/` — one directory per feature; all logic for that feature lives here
- `shared/` — components, hooks, and utilities used across features
- Entry: `main.tsx` → `App.tsx`

### E2E (`e2e/`)
Playwright TypeScript specs. Assumes both backend (8080) and frontend (5173) are running.

## Development Workflow

Start both servers concurrently before running E2E tests:
1. `back/`: `./mvnw spring-boot:run`
2. `front/`: `npm run dev`
3. `e2e/`: `npm run test`

## Key Conventions

- Features are added as self-contained modules under `front/src/features/<name>/` — do not scatter feature code into `shared/`.
- Backend follows the same vertical-slice pattern: each feature gets its own package with controller, service, and repository.
- TypeScript uses the tsconfig references pattern (`tsconfig.json` → `tsconfig.app.json` / `tsconfig.node.json`).
