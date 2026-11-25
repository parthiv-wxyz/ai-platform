# Product Requirements Document

## 1. Product summary

AI Council is a unified interface for using multiple AI model providers with user-owned credentials. It uses task-aware routing and optional multi-model collaboration to improve the usefulness of answers without wasting tokens.

## 2. Problem

Users currently switch between AI products to compare answers, verify claims, or combine specialist capabilities. Manually copying context between systems is inefficient. Blindly sending every prompt to every model is also expensive and wasteful.

## 3. Target users

- Developers and technical users who maintain API access to multiple providers.
- Researchers and students who need comparison or verification.
- Power users who want one interface for several models.
- Later: small teams that need auditable AI-assisted workflows.

## 4. Value proposition

- One interface for supported providers.
- User controls which providers and models can be used.
- The default path uses one model when that is sufficient.
- Additional models are called only when the task or user policy justifies them.
- Usage, estimated cost, and provider errors are visible.
- Different models can critique, verify, or build on one another.

## 5. Product principles

1. Token thrift is a feature, not an afterthought.
2. User consent controls paid usage.
3. User-owned credentials remain isolated.
4. Provider claims and subscription entitlements are never assumed.
5. Multi-model consensus must expose unresolved disagreement.
6. Start with reliable fundamentals before advanced agents.

## 6. MVP scope

### Must have
- User authentication.
- Secure provider credential connection / disconnection.
- Server-side provider adapter for at least one provider, then expand to three.
- Unified single-model chat.
- Model selection from the user's enabled providers.
- Per-request token / usage capture where available.
- Configurable per-request and per-session limits.
- No paid fallback unless explicitly enabled.
- Conversation persistence with user-level access control.
- Clear provider error and quota-exhaustion states.

### Should have
- Basic task classification.
- Model capability registry.
- Estimated cost display when pricing data is available.
- Optional second-model review.
- Usage dashboard.
- Export / delete conversation controls.

### Later
- Debate mode.
- Specialist agents.
- Consensus and evidence evaluation.
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

- As a user, I can add my own provider API key so requests are billed to my provider account.
- As a user, I can choose exactly which connected model receives a prompt.
- As a user, I can set a maximum token budget for a task.
- As a user, I can disable paid models and paid fallback.
- As a user, I can see which models were called and why.
- As a user, I can compare responses without automatically triggering a judge call.
- As a user, I can request a review when I want a second opinion.
- As a user, I can delete a credential and prevent future use of it.
- As a user, I can delete my conversation history.

## 9. MVP success criteria

- A user can securely connect and disconnect a provider credential.
- A single-model request completes end-to-end.
- No provider credential is returned to client-side code.
- A disabled or over-budget model is never called.
- A simple task does not trigger extra model calls.
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
