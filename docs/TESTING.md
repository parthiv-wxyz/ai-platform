# Testing Strategy

## Test pyramid

### Unit tests

- Provider request/response normalization.
- Model eligibility and routing.
- Token-budget calculations.
- Cost estimate calculations.
- Workflow state transitions.
- Early-stop conditions.
- Credential encryption/decryption helpers.
- Error normalization.

### Integration tests

- Authenticated provider connection CRUD.
- One real adapter against mocked provider HTTP responses.
- Chat route with mocked provider.
- Usage persistence.
- Conversation ownership.
- SSE event ordering.
- Cancellation and timeout handling.

### Security tests

- User A cannot read User B's provider connections.
- User A cannot invoke a model using User B's credential.
- Provider key never appears in API response.
- Provider key never appears in logs.
- Paid model cannot be selected when disabled.
- Run cannot exceed max model calls.
- Budget exhaustion prevents the next call.
- Unauthenticated requests are rejected.

### End-to-end tests

- Sign up / sign in.
- Add a test credential using a mocked provider.
- Send a prompt.
- See assistant response and usage.
- Disconnect provider.
- Confirm future requests cannot use the removed credential.

## Test environment

- Use fake credentials and mocked provider responses.
- Never use production keys in CI.
- Avoid billable live provider tests by default.
- If live smoke tests are added, make them opt-in and tightly budgeted.
- Seed only synthetic data.

## Quality gates

Before merging:

- Typecheck passes.
- Lint passes.
- Unit and integration tests pass.
- Security-sensitive tests pass.
- Build succeeds.
- No secrets are committed.

## Milestone 0 checks

The repository currently runs Vitest unit tests for the deterministic mock provider and includes a Playwright smoke test for the application shell. CI runs lint, TypeScript typechecking, unit tests, and the production build. Browser tests remain a local opt-in check until browser binaries are provisioned in CI.

## Milestone 1 checks

- Unit tests verify authentication is required, client-supplied ownership fields are rejected, and a second user cannot read, update, or delete another user's conversation through the service boundary.
- `supabase/tests/conversation_rls.sql` records the required two-user and anonymous RLS checks. Run it against a configured local Supabase stack before deployment.
- Live two-user RLS tests cannot run in CI without isolated Supabase test credentials; follow `docs/SUPABASE_SETUP.md` after applying the migration.
