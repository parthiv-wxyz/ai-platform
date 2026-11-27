# System Architecture

## 1. Architectural approach

Use a modular monolith initially. Deploy one web application with clear internal boundaries. Split services only when measured scale or operational needs justify it.

## 2. High-level request flow

1. Browser submits a validated coding task to the application server.
2. Server authenticates the user and checks authorization.
3. Policy engine loads the user's enabled providers, model allowlist, and budget.
4. Coding task classifier assigns a task type and selects a minimal execution plan.
5. Router selects an eligible model.
6. Provider adapter retrieves/decrypts the user's credential server-side and makes the provider request.
7. Usage recorder stores returned usage and the model call metadata.
8. Optional evaluator/reviewer runs only if the execution plan and budget permit it.
9. Synthesizer produces a final coding result or preserves distinct findings when synthesis would hide disagreement.
10. Server streams or returns the result and usage summary.

## 3. Logical modules

### Application layer

- Next.js routes, layouts, server components, route handlers.
- Authentication and session-aware UI.
- Chat, provider settings, model settings, usage dashboard.

### Domain layer

- User, ProviderConnection, Model, Conversation, Message, Run, ModelCall, UsageRecord.
- Policies for eligibility, budgets, and workflow selection.
- Coding task taxonomy and task-specific routing policies.

### AI integration layer

- Provider adapters.
- Normalized request and response contracts.
- Model capability registry.
- Error normalization.

### Orchestration layer

- Task classifier.
- Model router.
- Workflow planner.
- Agent executor.
- Evaluator and synthesizer.
- Stop-condition evaluator.
- Generated-code validation planner.

### Security and persistence

- Credential encryption.
- User authorization.
- Supabase database access.
- Usage and audit records.

## 4. Suggested source layout

```text
app/
  (auth)/
  dashboard/
  chat/
  settings/providers/
  api/
    chat/
    providers/
    usage/

components/
  chat/
  agents/
  providers/
  usage/

lib/
  ai/
    contracts/
    tasks/
    model-registry.ts
    policy.ts
    providers/
    registry/
    router/
    orchestrator/
    evaluator/
    synthesizer/
  security/
  usage/
  db/
  validation/

supabase/
  migrations/

tests/
  unit/
  integration/
  security/
```

## 5. Provider adapter contract

Every provider adapter should implement a common interface:

- `listModels()` where supported or use a curated registry.
- `validateCredential()` where a safe low-cost validation method exists.
- `generate()` for normalized text generation.
- `normalizeError()` for consistent provider error mapping.
- Usage extraction when provider response includes it.

Do not require all providers to support identical features. Capabilities must be explicit: streaming, structured output, vision, tool calls, context window, and usage reporting.

## 6. Coding task taxonomy

The classifier uses a closed, extensible coding taxonomy:

- `CODE_GENERATION` — produce an implementation from requirements.
- `DEBUGGING` — analyze an error, failure, or unexpected behavior with relevant source context.
- `CODE_REVIEW` — inspect correctness, security, performance, and maintainability.
- `REFACTORING` — improve structure or readability while preserving behavior.
- `TEST_GENERATION` — produce unit or integration tests from implementation and requirements.
- `ARCHITECTURE_DESIGN` — propose components, interfaces, data flows, and implementation steps.
- `CODEBASE_ANALYSIS` — explain repository structure, dependencies, and relevant execution paths.

Each task type has a routing policy. For example, code generation favors implementation capability, debugging receives the error and relevant source, code review uses correctness/security/maintainability criteria, and test generation receives the implementation plus requirements. The policy must state whether a second model is justified and what evidence it must add.

## 7. Routing policy

The router must filter models in this order:

1. User has an active connection for the provider.
2. Model is enabled by the user.
3. Model supports the task's required capability.
4. Model is present in the server-side free eligibility registry and is currently enabled.
5. Model fits the configured budget and token limits.
6. Model is not currently unavailable or rate-limited, if that status is known.
7. Rank remaining models by coding capability, task fit, local/cloud mode, user preference, and latency.

If no eligible free model remains, return a clear explanation. Unknown, paid, disabled, and unverified models are rejected; there is no paid fallback.

## 8. Orchestration state machine

Initial states:

- `received`
- `validated`
- `classified`
- `planned`
- `running_primary`
- `review_pending`
- `running_review`
- `synthesizing`
- `completed`
- `stopped_budget`
- `failed`
- `cancelled`

Transitions must be explicit and tested. Every model call consumes from a run-level budget reservation before execution. Release unused reservation after completion or failure.

Defaults are one model call, one bounded output, and one finite execution budget. There are no unlimited agent runs or automatic debate loops. Additional calls require a recorded reason, an explicit call limit, and remaining budget. Preserve material disagreements in the result.

Generated code is an artifact until validated. The system may run approved tests or static analysis in a sandboxed, explicitly configured environment, but it must never automatically execute untrusted generated code or claim validation that did not occur.

## 9. Streaming

Use server-sent events (SSE) for one-way progress updates initially. Stream meaningful events such as:

- run started
- plan selected
- model call started
- model response received
- review skipped / requested
- synthesis started
- usage updated
- run completed / failed

Do not stream internal chain-of-thought. Show concise status and user-visible summaries, not hidden reasoning.

## 10. Reliability

- Per-provider timeout.
- Bounded retries only for safe transient failures.
- Respect rate-limit responses.
- Idempotency key for run creation where feasible.
- Cancellation support where provider APIs allow it.
- Persist run status so a refresh does not create duplicate provider calls.
- Handle partial completion if one optional reviewer fails.
- Never retry a timed-out billable request without considering whether the provider may already have processed it.

## 11. Free-tier deployment assumptions

Use free hosting tiers only as a development constraint, not as a guarantee of permanent free production hosting. Check current limits, sleeping behavior, request duration, database storage, and commercial-use terms before launch. Avoid long-running background jobs in the MVP.

## 11. Milestone 1 authentication and persistence

- Supabase SSR clients are request-scoped. The browser receives only the public project URL and publishable/anon key.
- `proxy.ts` refreshes Supabase sessions; server pages and mutations independently verify the user with `auth.getUser()` and are the authorization boundary.
- Conversation services derive the owner exclusively from the verified session, never from a form field or request body.
- RLS is enabled on `profiles`, `conversations`, and `messages`, with policies restricted to the `authenticated` role and `(select auth.uid())` ownership checks.
- The `messages` composite foreign key binds `conversation_id` and `user_id` to the same conversation owner, preventing a cross-user message reference even before RLS is evaluated.
- The service-role key is intentionally absent from this milestone.

Gemini, local Ollama/Qwen3-Coder, provider credential encryption, and free eligibility enforcement are implemented foundations. Coding task classification, task-specific routing, bounded review, and generated-code validation remain future milestones.
