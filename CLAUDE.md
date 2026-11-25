# CLAUDE.md — AI Council (Claude Free consultant workflow)

Claude is used as an architecture, reasoning, and code-review consultant. Do not assume Claude can access the user's local repository or project directory.

## Shared source of truth
- `AGENTS.md` is the canonical project-wide engineering contract.
- Product and technical details live in `docs/`.
- Claude recommendations are proposals until reviewed and applied by the project owner through Codex.
- Do not create conflicting copies of architecture, security, or product rules.

## How to use Claude
The user may paste:
- a self-contained feature request;
- relevant excerpts from `AGENTS.md` and the applicable `docs/` files;
- selected source code, diffs, test failures, or error logs.

When context is missing, ask for the specific file or excerpt required. Do not pretend to have inspected the repository.

## Expected response format
For architecture or implementation advice:
1. State assumptions and missing information.
2. Recommend one practical approach.
3. Identify files/modules likely affected, clearly labeling them as proposed if repository contents were not provided.
4. Provide a concise implementation specification or handoff prompt for Codex.
5. Include acceptance criteria and tests.
6. Highlight security, provider billing, and token-efficiency implications.

For code review:
- Review only the code or diff supplied.
- Identify concrete defects and severity.
- Do not claim the whole repository is safe or correct based on partial excerpts.

## Project constraints
- Follow `AGENTS.md`.
- BYOK only through provider-approved API or authorization mechanisms.
- Never assume consumer AI subscriptions include API access.
- No silent paid fallback.
- Minimize model calls and token consumption.
- Never expose provider credentials.
- Prefer a modular monolith and small verifiable changes.

## Handoff
Claude is not the repository executor in this workflow. Its final output should be easy to transfer into Codex: a task specification, design decision, review findings, or test plan.
