# Multi-Agent Development Workflow

## Purpose
AI Council is developed using Codex desktop app, Claude Free, and Google Antigravity. Their access to the project directory is not assumed to be equal.

## Roles
### Codex desktop app — primary repository owner
- Open and work directly in the main project directory.
- Inspect and edit source files.
- Run terminal commands, tests, lint, typecheck, and builds.
- Own the primary implementation workflow and integration.
- Review and merge changes from secondary branches/worktrees.

### Claude Free — consultant
- Architecture and design discussions.
- Algorithm and orchestration design.
- Review pasted snippets and diffs.
- Identify risks, edge cases, and test cases.
- Generate detailed implementation prompts for Codex.
- Does not need local project-folder access. The user supplies relevant context manually.

### Google Antigravity — UI and browser specialist
- UI/UX implementation and iteration.
- Browser testing and visual validation.
- May inspect the project if its environment supports it.
- If it edits source code, it must work on a separate branch or worktree and report exact changes.

### Human project owner
- Owns product direction, credentials, approvals, and final merge decisions.

## Source of truth
- `AGENTS.md`: canonical project-wide instructions.
- `CLAUDE.md`: Claude consultant workflow.
- `docs/`: product and technical specifications.
- Git repository: actual code and change history.

If documentation conflicts with code or another document, report the conflict and ask for a decision. Do not silently choose.

## Recommended task cycle
1. Owner asks Claude for architecture advice when needed, supplying only relevant docs/code.
2. Claude returns a self-contained implementation specification and acceptance criteria.
3. Owner gives that task to Codex desktop app.
4. Codex inspects the actual repository, implements, tests, and reports results.
5. Antigravity may perform UI work or browser validation on a separate branch/worktree.
6. Codex reviews Antigravity's diff, runs regression checks, and integrates approved changes.
7. Owner approves the result and updates documentation if needed.

## Git safety
- Keep all work under Git.
- Codex is the integration owner for the primary branch.
- Never have Codex and Antigravity edit the same working tree at the same time.
- Use a separate branch or Git worktree for Antigravity code changes.
- Before editing, run `git status` and inspect diffs.
- Never discard, reset, or overwrite another agent's uncommitted work.
- Do not force-push shared branches.
- Use small commits with clear messages.
- Merge only after reviewing the diff and running relevant checks.

Suggested branches:
- `feat/<short-description>`
- `fix/<short-description>`
- `ui/<short-description>`
- `docs/<short-description>`
- `test/<short-description>`

## Claude-to-Codex handoff template

```text
Project: AI Council
Source: Claude Free architecture / review consultation

Task:
[One scoped outcome]

Context:
[Paste relevant current behavior, files, errors, or design decision.]

Canonical docs:
- AGENTS.md
- docs/[relevant docs]

Claude recommendation:
[Paste the agreed recommendation. Treat it as a proposal; inspect repository before implementation.]

Acceptance criteria:
- [Observable requirement 1]
- [Observable requirement 2]

Constraints:
- Inspect current repository and git status first.
- Follow AGENTS.md.
- Do not assume files or dependencies exist.
- Do not change unrelated files.
- Do not expose credentials or weaken security.
- Enforce token and paid-usage budgets.
- Add tests and update docs where appropriate.

Before editing:
1. Inspect relevant files.
2. State a concise plan.
3. Identify assumptions or conflicts.

After editing:
1. Run relevant tests, lint, typecheck, and build as applicable.
2. Summarize changed files and exact checks/results.
3. Report limitations and next steps.
```

## Codex task template

```text
Read AGENTS.md and relevant docs before editing.
Inspect the repository and git status.
Implement only this task: [task].
Acceptance criteria: [criteria].
Do not change unrelated files.
Add tests.
Run relevant checks and report exact results.
```

## Antigravity handoff template

```text
Work only on the assigned UI task.
Read AGENTS.md and relevant UI/product docs.
Use the assigned branch/worktree; do not edit Codex's active working tree.
Do not change backend, provider, credential, or database logic unless explicitly assigned.
Run browser checks and report screenshots/findings, changed files, and test results.
Do not merge; hand the branch/diff back to Codex for review.
```

## Avoid
- Asking all three agents to implement the same feature simultaneously.
- Treating Claude's proposed file paths as verified repository structure.
- Copying secrets or `.env` contents into Claude or any external chat.
- Letting Antigravity and Codex edit the same working directory concurrently.
- Allowing any agent to change security rules or paid-fallback behavior without explicit review.
- Accepting generated provider endpoints, model IDs, or pricing without checking current official documentation.

## End-of-task handoff
Every agent must report:
- What changed.
- Branch / commit, if applicable.
- Tests and checks actually run.
- Known issues.
- Exact next task recommendation.
