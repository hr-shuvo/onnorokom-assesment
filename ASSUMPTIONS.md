# Assumptions and Technical Decisions

## 1. Class and Shift

- Class and Shift are maintained as separate concepts in the backend.
- They can be displayed together in the frontend.
- Shift is implemented as an enum because shifts are considered predefined and relatively fixed (Morning, Day, Evening).
- No separate CRUD functionality is needed unless shifts become dynamically configurable in the future.

## 2. Shared UI for Parents and Admins

- The specifications require the same UI for both roles.
- Core components and functionality are shared, but layouts are adapted to provide a role-specific user experience.

## 3. UI Component Library

- Use shadcn/ui instead of raw HTML or custom components.
- Prefer existing shadcn/ui components to maintain a consistent UI.

## 4. Config - Admission

- Initially we stored admission data in the database, but realized this was unnecessary since there is always only one admission config published at a time. We decided to use local file storage instead, e.g. `admission-config.json`.
- The `config/` directory is mounted as a Docker named volume (`api_config`) so admin-edited settings survive `docker compose down && up --build`, not just a plain restart.

## 5. Hold duration

- `HOLD_DURATION_SECONDS` env var is used if set (default 600 in docker-compose), otherwise falls back to the JSON admin setting `HoldMinutes`. This way it matches the spec but an admin can still tune it from the UI.

## 6. Bonus items not attempted

- Did not attempt running two backend processes on different ports sharing one DB, ran out of time.
