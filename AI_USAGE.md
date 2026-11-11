# AI Usage Documentation

## 1. AI Tools Used

- Claude
- ChatGPT

Both were used as development assistants throughout the project.

## 2. How AI Was Used

- **Code Review:** Reviewing existing code and suggesting improvements.
- **Architecture:** Exploring project structure, design patterns, and implementation approaches.
- **Feature Ideas:** Discussing new features and possible improvements.
- **Refactoring:** Improving readability, maintainability, and code organization.
- **Debugging:** Investigating errors using shared code, logs, and error messages.
- **Technical Research:** Exploring libraries, tools, and alternative solutions.

## 3. AI Limitations and Corrections

- First pass at the concurrency handling for seat holds didn't account for Postgres throwing serialization errors under real concurrent load. Fixed by wrapping the hold/confirm flow in `Serializable` transactions and returning a `409 Conflict` instead of crashing. Caught this by writing the concurrency test and seeing it fail.
- AI suggested adding `BuggyController` to test error handling, but one of its endpoints threw a real unhandled 500, which goes against the spec. Noticed it on a final pass and just deleted the controller.
- Hold duration was only reading from the JSON admin settings file at first, missed that the spec wants a `HOLD_DURATION_SECONDS` env var specifically. Added that as the primary source, JSON setting as fallback.

## 4. Verification

AI suggestions were reviewed before implementation. Solutions were evaluated against project requirements, and debugging changes were tested.

Final technical decisions, implementation, and verification remained the developer's responsibility.