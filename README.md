# AI Council

**One question. Multiple intelligences. One better-informed result.**

AI Council is a BYOK multi-model AI collaboration platform. Users connect AI provider credentials they are authorized to use. The platform can route a task to one suitable model, optionally request independent reviews, and synthesize a final response.

The central product differentiator is not simply access to many models. It is **cost-aware orchestration**: use the fewest model calls needed to satisfy the task.

## Product status

This repository now contains Milestone 0: a runnable Next.js foundation with a responsive shell, strict TypeScript, Zod environment validation, a normalized deterministic mock provider, and automated quality checks. Real providers, Supabase, authentication, and credential encryption are intentionally not connected yet.

## Core principles

- BYOK: users supply their own API keys or use supported official authorization integrations.
- No subscription circumvention: consumer chat subscriptions do not automatically include API access.
- No silent paid fallback.
- Minimal token usage and transparent usage reporting.
- Provider-neutral architecture.
- Secure server-side credential handling.
- Consensus is a decision-support feature, not a guarantee of correctness.

## Planned capabilities

1. Unified chat across supported model providers.
2. User-managed provider connections.
3. Model capability and availability registry.
4. Cost-aware model routing.
5. Optional parallel comparison, debate, review, and specialist workflows.
6. Token / usage budgets and hard stop conditions.
7. Evidence-aware synthesis that preserves disagreements.
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
2. Copy `.env.example` to `.env.local` if you want to override the local app URL.
3. Run `npm run dev` and open `http://localhost:3000`.

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

- AI Council does not provide free inference by itself. BYOK users pay providers according to their own plans and API billing arrangements, unless a provider offers an eligible free API quota.
- A user's ChatGPT Plus, Claude Pro, or other consumer subscription must not be treated as API credits unless the provider explicitly supports that access path.
- OAuth and account linking must use provider-approved flows. Never ask for provider website passwords or automate consumer websites to bypass API billing.
- The project should remain usable in single-model mode if multi-agent execution is unavailable or too expensive.

## Multi-agent workflow

Codex desktop app is the primary repository owner, Claude Free is used as a consultant, and Google Antigravity is used for UI/browser work. See `CLAUDE.md` and `docs/MULTI_AGENT_WORKFLOW.md`.

## Milestone 0 implementation

- `app/` contains the App Router shell.
- `lib/env.ts` validates application environment variables with Zod.
- `types/ai.ts` defines the provider-neutral AI contract.
- `lib/ai/providers/mock-provider.ts` provides deterministic local responses for tests.
- `tests/unit/` contains Vitest unit tests.
- `tests/e2e/` contains Playwright browser tests.
- `.github/workflows/ci.yml` runs lint, typecheck, tests, and build.

No real provider credentials, provider SDKs, Supabase connections, authentication, or encryption are used in this milestone.
