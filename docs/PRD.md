# Product Requirements Document

## 1. Product summary

AI Council is a coding-only platform for software generation, debugging, review, refactoring, testing, architecture planning, and repository analysis. It uses task-aware routing and bounded optional review without wasting tokens.

## 2. Problem

Developers currently switch between coding assistants, terminals, issue trackers, and test tools while manually copying code and errors between systems. This loses repository context and makes debugging and review inefficient. Blindly sending every coding task to every model is also expensive and wasteful.

## 3. Target users

- Developers working in small and medium-sized codebases.
- Technical users who want coding models without paid platform-funded inference.
- Teams that need auditable, bounded AI-assisted engineering workflows.

## 4. Value proposition

- One interface for common software-engineering tasks.
- User controls which eligible coding route is used.
- The default path uses one model when that is sufficient.
- Additional models are called only when the task and policy justify them.
- Generated code, validation results, usage, and provider errors are visible.
- Model disagreement is preserved rather than hidden behind an unsupported consensus claim.

## 5. Product principles

1. Token thrift is a feature, not an afterthought.
2. Server-side policy prevents paid inference.
3. User-owned credentials remain isolated.
4. Provider claims and subscription entitlements are never assumed.
5. Multi-model consensus must expose unresolved disagreement.
6. Start with reliable fundamentals before advanced agents.

## 6. MVP scope

### Must have
- User authentication.
- Secure provider credential connection / disconnection.
- Server-side adapters for Gemini, local Ollama/Qwen3-Coder, and MockProvider.
- Unified single-model coding workflows.
- Coding-task selection and model routing from the eligible provider registry.
- Per-request token / usage capture where available.
- Configurable per-request and per-session limits.
- No paid inference or fallback in the free-only product.
- Conversation persistence with user-level access control.
- Clear provider error and quota-exhaustion states.

### Should have
- Basic task classification.
- Model capability registry.
- Estimated cost display when pricing data is available.
- Optional bounded second-model review for coding tasks.
- Usage dashboard.
- Export / delete conversation controls.

### Later
- Unbounded debate loops or autonomous coding agents.
- Automatic execution of untrusted generated code.
- Specialist workflows without explicit budgets and stopping rules.
- Semantic cache.
- Team workspaces and shared workflows.
- Paid SaaS features such as team controls, audit history, and advanced orchestration.

## 7. Explicit non-goals for MVP

- Reusing consumer chat subscriptions as API credits without an official supported mechanism.
- Browser automation against consumer AI websites.
- Unlimited free inference.
- Training or fine-tuning foundation models.
- Autonomous agents that can spend money or take external actions.
- Microservices, Kubernetes, or complex distributed infrastructure.
- Guaranteed factual correctness from model voting.

## 8. User stories

- As a user, I can connect Gemini or choose a local Ollama/Qwen route.
- As a user, I can choose a coding task type and eligible model route.
- As a user, I can set a maximum token budget for a task.
- As a user, I can see that only verified free-tier models are available.
- As a user, I can see which models were called and why.
- As a user, I can request a bounded code review or second opinion without automatically triggering extra calls.
- As a user, I can delete a credential and prevent future use of it.
- As a user, I can delete my conversation history.

## 9. MVP success criteria

- A user can securely connect and disconnect a provider credential.
- A single-model coding request completes end-to-end.
- No provider credential is returned to client-side code.
- A disabled or over-budget model is never called.
- A simple coding task does not trigger extra model calls.
- Generated code is never described as executed unless validation actually ran.
- Usage records are associated with the correct user and provider.
- Provider failures are normalized and understandable.
- Tests prove cross-user credential and conversation isolation.

## 10. Product metrics

- Median model calls per task.
- Input and output tokens per completed task.
- Percentage of tasks completed with one call.
- Additional-call rate and reason.
- User-configured budget stop rate.
- Provider error rate.
- Task completion latency.
- User-rated usefulness.
- Estimated cost per completed task (only where reliable pricing metadata exists).

Do not optimize only for fewer tokens: a cheap but incorrect answer is not a successful result. Track quality and cost together.
