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