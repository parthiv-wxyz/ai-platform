# Development Roadmap

The roadmap is milestone-based. Do not begin advanced multi-agent features until the single-provider gateway is secure and tested.

## Phase 0 — Repository foundation

- [x] Create Next.js + TypeScript application.
- [x] Configure linting, formatting, typecheck, and test runner.
- [x] Add environment variable validation.
- [x] Configure Supabase client integration and migrations.
- [x] Add CI checks.
- [x] Add app shell and responsive navigation.
- [x] Add a normalized deterministic mock provider for local tests.

Exit criteria: clean install, local development, CI green. Supabase remains intentionally deferred to Phase 1.

## Phase 1 — Authentication and user data

- [x] Supabase Auth.
- [x] Protected routes and server-side session validation.
- [x] Database Row Level Security.
- [ ] User settings.
- [x] Conversation CRUD.
- [x] Security tests for cross-user access.

Exit criteria: users can sign in and only access their own data. Live two-user RLS verification requires the manual Supabase setup in `docs/SUPABASE_SETUP.md`.

## Phase 2 — Secure BYOK gateway

- [ ] Credential encryption service.
- [ ] Add / validate / disconnect provider credential.
- [ ] Provider adapter contract.
- [ ] Integrate one provider end-to-end.
- [ ] Add normalized errors and timeouts.
- [ ] Ensure provider calls are server-side only.
- [ ] Add credential isolation tests.

Exit criteria: authenticated user can make one model call with their own key.

## Phase 3 — Unified chat and usage

- [ ] Model registry.
- [ ] Unified chat UI.
- [ ] Streaming response where supported.
- [ ] Store user messages and assistant responses.
- [ ] Capture provider usage metadata.
- [ ] Show usage per model call.
- [ ] Add request token limits.
- [ ] Add provider-specific model enable/disable controls.

Exit criteria: user can chat with one of their enabled models and inspect usage.

## Phase 4 — More providers and routing

- [ ] Add second provider adapter.
- [ ] Add third provider adapter.
- [ ] Add capability-based filtering.
- [ ] Add user model preferences.
- [ ] Add free-only / paid-allowed policy.
- [ ] Add deterministic fallback only within allowed policy.
- [ ] Add routing tests.

Exit criteria: router chooses only eligible models and never silently uses a paid route.

## Phase 5 — Token efficiency

- [ ] Task complexity classifier.
- [ ] Minimal execution planner.
- [ ] Context window pruning.
- [ ] Output token limits.
- [ ] Run-level budget reservation.
- [ ] Early-stop policy.
- [ ] Optional reviewer gate.
- [ ] Usage and cost estimate display with clear uncertainty labels.

Exit criteria: simple prompts use one model call; additional calls require a recorded reason and available budget.

## Phase 6 — Multi-model collaboration

- [ ] Parallel comparison mode.
- [ ] Reviewer mode.
- [ ] Debate mode with a fixed round cap.
- [ ] Structured evaluation rubric.
- [ ] Synthesis that preserves disagreements.
- [ ] Partial failure handling.
- [ ] Real-time run events.

Exit criteria: user explicitly opts into collaboration and sees which agents ran and why.

## Phase 7 — Portfolio-quality release

- [ ] Responsive UI polish.
- [ ] Accessibility review.
- [ ] Security review.
- [ ] Load and latency tests.
- [ ] README screenshots and architecture diagram.
- [ ] Demo data and demo mode without real provider keys.
- [ ] Deployment and monitoring.
- [ ] Public issue tracker and contribution guide.

## Phase 8 — SaaS exploration

Only after real usage and feedback:

- Team workspaces.
- Usage policies for organizations.
- Shared prompt/workflow templates.
- Audit exports.
- Optional platform subscription for product features.
- Provider billing / BYOK onboarding improvements.

Do not add platform-funded inference until unit economics and abuse controls are understood.
