# Architecture Decision Records

Record important decisions here. Add a new entry rather than silently reversing an existing decision.

## ADR-001: BYOK as the initial model access strategy

**Status:** Accepted

**Decision:** Users provide their own API keys or connect through provider-approved authorization mechanisms.

**Reasoning:** Avoids platform-funded inference costs and aligns with the zero-upfront-cost goal.

**Consequences:** Onboarding is more technical. Provider APIs and consumer subscriptions are distinct. Some users may not have API access or free quotas.

## ADR-002: Modular monolith for MVP

**Status:** Accepted

**Decision:** Start with a single Next.js application and internal module boundaries.

**Reasoning:** Lower operational complexity and easier free-tier deployment for a personal project.

**Consequences:** Keep modules decoupled so the orchestration engine can be extracted later if needed.

## ADR-003: Single-model-first product delivery

**Status:** Accepted

**Decision:** Build secure single-model chat and usage tracking before multi-agent workflows.

**Reasoning:** The provider gateway, credentials, and usage controls are foundational. Multi-agent features multiply failure and cost modes.

## ADR-004: Token-efficient orchestration by default

**Status:** Accepted

**Decision:** One model call is the default. Additional calls require an explicit workflow or a documented planner reason, and must pass budget checks.

**Reasoning:** Avoid unnecessary token use and unexpected provider charges.

## ADR-005: No silent paid fallback

**Status:** Accepted

**Decision:** Paid fallback is disabled by default and must be explicitly enabled by the user.

**Reasoning:** Users own provider billing and must control spend.

## ADR-006: Custom state machine before orchestration framework

**Status:** Accepted

**Decision:** Implement a small typed workflow state machine before adopting LangGraph or another agent framework.

**Reasoning:** The initial workflows are simple, and explicit control helps enforce budgets and stopping conditions.

**Revisit when:** Workflows require complex branching, persistence, human approval checkpoints, or graph-level observability.
