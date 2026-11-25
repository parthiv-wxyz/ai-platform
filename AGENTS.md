# AGENTS.md — AI Council

## Mission
Build AI Council: a BYOK (Bring Your Own Key), multi-model AI collaboration platform. Users connect provider credentials they are authorized to use. AI Council routes tasks to suitable models, coordinates optional collaboration, and returns a consolidated result while minimizing unnecessary inference.

## Product principles
1. **Token efficiency first.** Never call multiple models by default just to create activity. Start with the smallest useful execution plan.
2. **No surprise spend.** Never silently switch from a free/low-cost route to a paid route. Respect user budgets and provider settings.
3. **BYOK, not subscription circumvention.** Do not assume a consumer AI subscription grants API access. Use official APIs, supported OAuth flows, or user-provided API keys only where permitted.
4. **Privacy by design.** Provider credentials are secrets. Never expose them to the browser, logs, analytics, or other users.
5. **Provider independence.** Keep provider-specific logic behind adapters. Product logic must not depend on one provider's response format.
6. **Honest output.** A consensus score is an evaluation signal, not proof of truth. Preserve uncertainty and material disagreement.
7. **Build the smallest working system.** Prefer a modular monolith over premature microservices.

## Current product decisions
- Project name: AI Council.
- Personal side project with a portfolio-to-SaaS path.
- Development and hosting target: free tiers / zero upfront cost.
- Model access: users bring their own API keys or use supported official authorization integrations.
- Initial providers: OpenAI, Google Gemini, Anthropic. Verify current official docs before implementation.
- Initial product milestone: secure unified AI gateway and single-model chat before multi-agent debate.
- Initial stack: Next.js + TypeScript, Supabase Auth/Postgres, server-side provider adapters, Vercel free tier where suitable.
- Start with a custom, deterministic orchestration state machine. Add a graph framework only if complexity justifies it.

## Tooling and agent roles
- **Codex desktop app is the primary repository owner and implementation environment.** It is expected to open the project directory, inspect files, run terminal commands, edit code, test, and manage Git.
- **Claude Free is a planning/review consultant only.** Do not assume it can open or operate on the local project directory. Give it self-contained questions, selected code excerpts, and relevant documentation text when needed. Transfer its recommendations back into the repository through Codex.
- **Google Antigravity is a secondary UI/browser validation environment.** If it edits code, use a separate Git branch or worktree. Do not let it and Codex edit the same working tree concurrently.
- The human project owner makes final product and merge decisions.

## Engineering rules
- Use strict TypeScript. Avoid `any`; use `unknown` and narrow it.
- Validate all external input at runtime (e.g. Zod).
- Keep provider SDK calls server-side only.
- Do not commit `.env`, API keys, tokens, service-role keys, or real user data.
- Add tests for routing, budget enforcement, credential isolation, and orchestration stopping conditions.
- Make usage/cost estimates explicit and label estimates as estimates.
- Persist only the minimum data needed. Avoid storing raw provider credentials in plaintext.
- Every provider request must have timeout, error normalization, and usage capture where the provider returns usage.
- Never retry non-idempotent or potentially billable requests blindly. Retry only with bounded policy and clear handling.
- Respect provider rate limits and terms of service.
- Keep user-visible errors actionable but do not reveal secrets or internal stack traces.

## Required workflow for Codex
Before changing code:
1. Read this file and relevant files under `docs/`.
2. Inspect the existing repository structure and `git status`; do not assume files or dependencies exist.
3. State the intended change briefly.
4. Make the smallest coherent change.
5. Run relevant tests, lint, typecheck, and build where available.
6. Report changed files, checks run, results, known limitations, and required manual setup.

## Architecture boundaries
- `app/`: routes, layouts, server actions / route handlers.
- `components/`: UI only; no provider secrets or direct provider SDK calls.
- `lib/ai/providers/`: provider adapters and normalized request/response types.
- `lib/ai/router/`: model selection and eligibility.
- `lib/ai/orchestrator/`: workflow execution and stopping rules.
- `lib/ai/evaluator/`: evaluation criteria and structured scoring.
- `lib/security/`: encryption, authorization, secret handling.
- `lib/usage/`: budgets, usage records, cost estimates.
- `lib/db/`: database access.
- `types/`: shared domain types.
- `tests/`: unit, integration, and security tests.

## Definition of done
A feature is not complete until:
- authorization is enforced server-side;
- inputs and outputs are validated;
- secrets and personal data are protected;
- loading, empty, success, and error states are handled;
- tests cover important logic;
- documentation and `.env.example` are updated where needed;
- no paid fallback or extra model call can happen without the configured policy allowing it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
