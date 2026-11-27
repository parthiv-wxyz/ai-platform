# Token Efficiency and Spend-Control Policy

## Goal

Minimize unnecessary inference while preserving engineering quality. A low token count is not success if generated code becomes materially less correct, secure, maintainable, or testable.

## 1. Default execution policy

- Code generation, refactoring, and test generation: one model call by default.
- Debugging and codebase analysis: one model call with focused error and source context.
- Code review: one model call; optional second review only when a specific unresolved risk justifies it.
- Architecture design: one model call; additional review only with explicit scope and a fixed cap.

These are defaults, not promises. The planner must account for provider availability, user preferences, model capabilities, and budget.

## 2. Hard constraints

Every run should have:
- Maximum model calls.
- Maximum output tokens per call.
- Optional total input/output token ceiling.
- Optional estimated monetary ceiling.
- Allowed provider/model list.
- Free-only provider eligibility policy.
- Maximum collaboration rounds.
- Timeout.
- Validation command and sandbox policy, when code validation is enabled.

The server enforces these constraints. Client-side controls are not security boundaries.

## 3. Model-call gate

Before every call, evaluate:
1. Is another call required to meet the user's selected workflow?
2. Is there a specific unresolved question the call can answer?
3. Is the model eligible under user/provider policy?
4. Is there enough remaining budget?
5. Is the expected benefit worth the estimated token and latency cost?

If any hard constraint fails, stop or return the best available partial result with a clear explanation.

## 4. Context management

- Include only relevant conversation turns.
- Summarize older context when needed.
- Avoid repeating static instructions in every agent handoff where provider caching or prompt structure can reduce cost.
- Pass structured findings rather than entire transcripts.
- Keep a maximum context size.
- Do not summarize away critical facts, caveats, or user constraints.

## 5. Output control

- Set explicit output token limits.
- Ask for concise structured responses where appropriate.
- Avoid asking every agent to restate the entire problem.
- Do not ask a judge to repeat all candidate answers; provide compact summaries and evaluation criteria.
- Store only necessary user-visible output and usage metadata.

## 6. Caching

Caching may be added for:
- Model metadata.
- Public provider capability data.
- Repeated deterministic classification results.
- User-approved reusable results.

Do not share private conversation or response cache entries across users. Cache keys must include all relevant context, model/version, and policy parameters. Be cautious with semantic caching because similar prompts can have materially different intent.

## 7. Cost estimates

- Maintain provider pricing metadata separately from application code.
- Store pricing version and timestamp.
- Show estimates as estimates.
- If pricing is unknown, say so rather than inventing a cost.
- Prefer provider-reported usage for actual token counts.
- Explain that provider billing may differ due to caching, tool calls, modalities, rounding, or pricing changes.

## 8. Coding safety and no surprise billing

- Paid fallback is off by default.
- Free-only mode must be enforced in the server router.
- If free options are exhausted, stop with an actionable message; paid API inference remains prohibited.
- Never infer that a user's consumer subscription pays for API requests.
- Never use a provider key for a different user's request.

The free-only gateway preserves the single-model default: one eligible Gemini or local Ollama request per coding task, an explicit `maxOutputTokens` limit, a server timeout, no hidden retries, and no paid-provider fallback. If the Gemini quota is exhausted or Ollama is unavailable, the request stops with an actionable error.

Generated code is never treated as executed. Validation must be an explicit, sandboxed step using approved tests or static analysis. Never automatically execute untrusted generated code.

## 9. Metrics
Track:
- Calls per run.
- Input/output tokens per call.
- Calls avoided by early stop.
- Runs stopped by budget.
- Additional calls by reason.
- Quality feedback.
- Latency and provider errors.

## 10. Acceptance tests
- A simple task in default mode makes at most one model call.
- A max-call limit of one cannot be exceeded.
- Models outside the server-side free eligibility registry are never selected.
- An exhausted budget stops execution before the next call.
- A reviewer is not invoked when review is disabled.
- Cancellation prevents future workflow steps.
- Generated code is not reported as validated unless the configured check actually ran.
