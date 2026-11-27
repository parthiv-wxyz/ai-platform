# AI Council

**One coding task. One bounded, useful engineering result.**

AI Council is a coding-only AI platform. It helps developers generate, debug, review, refactor, and test code, understand repositories, and plan software architecture. Users can connect an authorized Google Gemini API key or run Qwen3-Coder locally through Ollama.

The central product differentiator is **bounded coding orchestration**: use the fewest model calls needed, validate generated output where possible, and never claim code was executed when it was only generated.

## Product status

This repository contains the free-only coding foundation: Supabase authentication, protected conversations, encrypted Gemini credentials, local Ollama/Qwen support, a server-side free-model eligibility registry, and single-model coding chat. Task-aware orchestration and bounded review workflows remain future work.

## Core principles

- BYOK: users supply their own API keys or use supported official authorization integrations.
- No subscription circumvention: consumer chat subscriptions do not automatically include API access.
- Free-only execution: unknown, paid, disabled, or unverified models are rejected server-side.
- Coding-specific task routing and transparent usage reporting.
- Provider-neutral architecture.
- Secure server-side credential handling.
- Consensus is a decision-support feature, not a guarantee of correctness.

## Coding capabilities

1. Code generation and implementation planning.
2. Debugging and error analysis.
3. AI code review for correctness, security, and maintainability.
4. Code refactoring.
5. Unit and integration test generation.
6. Repository understanding and codebase analysis.
7. Bounded, task-specific review when additional analysis is justified.
8. Conversation history and usage analytics.

## Initial stack

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth + PostgreSQL
- Zod for runtime validation
- Provider SDKs / official APIs behind server-side adapters
- Vercel and Supabase free tiers where their current limits are suitable

Free-tier limits and provider pricing change. Verify current official documentation before relying on a specific quota or feature.

## Getting started

The project requires Node.js 20.9 or newer. The repository currently uses npm and includes a committed `package-lock.json`.

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and configure Supabase using [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md).
3. Apply the committed Supabase migration.
4. Optional local Qwen setup: install Ollama, run `ollama pull qwen3-coder`,
   and keep Ollama running while using the local route.
5. Run `npm run dev` and open `http://localhost:3000`.

Quality checks:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e` (requires the Playwright browser installation)

Read `AGENTS.md` and `docs/VIBE_CODING_GUIDE.md` before making changes.

## Documentation

- [`AGENTS.md`](./AGENTS.md) — instructions for coding agents.
- [`docs/PRD.md`](./docs/PRD.md) — product requirements and scope.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system architecture and boundaries.
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — staged delivery plan.
- [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) — proposed database entities.
- [`docs/API_CONTRACTS.md`](./docs/API_CONTRACTS.md) — initial API contract.
- [`docs/SECURITY.md`](./docs/SECURITY.md) — credential and application security.
- [`docs/TOKEN_EFFICIENCY.md`](./docs/TOKEN_EFFICIENCY.md) — token and cost controls.
- [`docs/PROVIDER_INTEGRATION.md`](./docs/PROVIDER_INTEGRATION.md) — adapter design and provider rules.
- [`docs/VIBE_CODING_GUIDE.md`](./docs/VIBE_CODING_GUIDE.md) — practical AI-assisted development workflow.
- [`docs/TESTING.md`](./docs/TESTING.md) — test strategy.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — architecture decision records.

## Important limitations

- Gemini free-tier quotas and local Ollama hardware limits are not guarantees of unlimited inference.
- A user's ChatGPT Plus, Claude Pro, or other consumer subscription must not be treated as API credits unless the provider explicitly supports that access path.
- OAuth and account linking must use provider-approved flows. Never ask for provider website passwords or automate consumer websites to bypass API billing.
- The project must remain useful in single-model mode; multiple model calls are optional, bounded, and justified by the coding task.

## Multi-agent workflow

Codex desktop app is the primary repository owner, Claude Free is used as a consultant, and Google Antigravity is used for UI/browser work. See `CLAUDE.md` and `docs/MULTI_AGENT_WORKFLOW.md`.

## Current implementation

- `app/` contains the App Router shell.
- `lib/env.ts` validates application environment variables with Zod.
- `types/ai.ts` defines the provider-neutral AI contract.
- `lib/ai/providers/mock-provider.ts` provides deterministic local responses for tests.
- `lib/ai/providers/gemini-provider.ts` adapts the official Google Gen AI SDK to the normalized contract.
- `/dashboard/providers` manages an encrypted, user-owned Gemini connection; keys are never displayed after saving.
- `lib/supabase/` creates request-scoped Supabase SSR clients and refreshes sessions in `proxy.ts`.
- `app/(auth)/` contains email/password sign-up, confirmation, sign-in, and sign-out flows.
- `app/dashboard/` provides protected conversation create, read, update, and delete flows.
- `supabase/migrations/` contains reproducible schema, foreign key, index, grant, trigger, and RLS definitions.
- `tests/unit/` contains Vitest unit tests.
- `tests/e2e/` contains Playwright browser tests.
- `.github/workflows/ci.yml` runs lint, typecheck, tests, and build.

Provider API keys are stored as AES-256-GCM ciphertext using a server-only encryption key. The server-only Supabase service-role key is used only after session ownership is verified to read encrypted credential columns; it is never exposed to the browser.
