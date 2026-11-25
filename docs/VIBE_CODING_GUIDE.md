# Vibe-Coding Guide

This project is intended to be developed with an AI coding assistant. Use small, verifiable tasks. Do not ask the agent to build the entire SaaS in one prompt.

## 1. Before every coding task

Tell the coding assistant:
- Read `AGENTS.md`.
- Read the relevant architecture / product documents.
- Inspect the actual repository before assuming anything.
- Make a short implementation plan.
- Change only the files needed for the task.
- Run tests, lint, and typecheck.
- Report exactly what changed and what remains.

## 2. Recommended prompt format

```text
Read AGENTS.md and the relevant files under docs/ before making changes.

Task:
[One clearly scoped feature]

Constraints:
- Follow the existing project structure and conventions.
- Do not introduce unnecessary dependencies.
- Do not expose secrets to the browser.
- Enforce authentication and authorization server-side.
- Preserve token and paid-usage budgets.
- Do not implement unrelated features.

Process:
1. Inspect the existing code.
2. Explain the implementation plan briefly.
3. Implement the smallest complete change.
4. Add or update tests.
5. Run lint, typecheck, and relevant tests.
6. Summarize changed files, commands run, and known limitations.

Do not claim a check passed unless you actually ran it.
```

## 3. Work in vertical slices

Good task:
"Implement the provider connection database migration, RLS policies, and tests."

Bad task:
"Build all AI provider integrations, agents, billing, dashboard, and security."

Each task should end with a working state.

## 4. Suggested task sequence

1. Scaffold Next.js app and quality tooling.
2. Add environment validation.
3. Configure Supabase Auth.
4. Create profiles and RLS migration.
5. Build protected dashboard shell.
6. Implement credential encryption module with tests.
7. Implement provider connection CRUD.
8. Implement one provider adapter.
9. Implement single-model chat endpoint.
10. Add usage capture and display.
11. Add second provider.
12. Add model registry and router.
13. Add hard budget enforcement.
14. Add optional reviewer workflow.
15. Add comparison and debate workflows.

## 5. Review every AI-generated change

Check:
- Did the agent add a dependency unnecessarily?
- Is any API key exposed in client code?
- Is authorization enforced on the server?
- Are database policies present?
- Can a paid model be called unexpectedly?
- Can the workflow exceed its call or token limit?
- Are errors and timeouts handled?
- Are tests meaningful?
- Does the code match the actual installed SDK version?

## 6. Avoid common vibe-coding failures

- Do not let the agent invent provider API endpoints or model names.
- Do not trust generated pricing tables without official sources.
- Do not let it disable TypeScript or lint rules to make builds pass.
- Do not accept placeholder security as production security.
- Do not paste real API keys into prompts or source files.
- Do not ask for a full rewrite when a targeted fix is enough.
- Do not merge code that has not been typechecked and tested.

## 7. Definition of a completed task

A task is complete only when the feature works locally, authorization is correct, important tests pass, no secrets are exposed, and documentation is updated.
