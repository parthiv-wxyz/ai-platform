# Initial API Contracts

Contracts are illustrative and should be implemented with runtime validation (e.g. Zod). All routes require authentication unless explicitly marked public.

## Provider connections

### `GET /api/providers`
Returns connected provider metadata, never credentials.

Example response:
```json
{
  "connections": [
    {
      "id": "uuid",
      "provider": "google",
      "label": "Personal Gemini key",
      "status": "active",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### `POST /api/providers`
Request:
```json
{
  "provider": "google",
  "label": "Personal Gemini key",
  "apiKey": "user-supplied-secret"
}
```

Rules:
- Validate provider identifier and key format where possible.
- Never log request body.
- Encrypt before persistence.
- Return only non-secret connection metadata.
- Apply rate limits.
- Do not validate a key using a billable request unless the user is clearly informed.

### `DELETE /api/providers/:connectionId`
Disconnects and deletes the stored credential for the authenticated owner. Must enforce ownership server-side.

## Chat

### `POST /api/chat`
Request:
```json
{
  "conversationId": "uuid",
  "message": "Explain database indexing",
  "modelPreference": {
    "provider": "google",
    "modelId": "selected-model-id"
  },
  "execution": {
    "mode": "single",
    "maxModelCalls": 1,
    "maxOutputTokens": 700,
    "allowPaidModels": false
  }
}
```

Rules:
- Validate conversation ownership.
- Validate model is enabled and belongs to an active connection.
- Enforce output and run budgets server-side.
- `allowPaidModels: false` is a policy constraint, not a UI hint.
- Never trust a client-supplied price or token count.
- If streaming, use a documented SSE event format.

### Suggested SSE events
```text
event: run.started
data: {"runId":"uuid"}

event: model.started
data: {"provider":"google","modelId":"selected-model-id","callRole":"primary"}

event: model.completed
data: {"modelCallId":"uuid","usage":{"inputTokens":120,"outputTokens":300}}

event: run.completed
data: {"runId":"uuid","assistantMessageId":"uuid"}
```

Do not send API keys, raw provider headers, internal stack traces, or hidden chain-of-thought in events.

## Conversations

Milestone 1 exposes conversation CRUD through protected server actions. The server obtains the owner from the verified Supabase session; it never accepts a `userId` in input. A later API version may expose equivalent route handlers, preserving the same validation and ownership rules.

- Create: title only, maximum 200 characters.
- Read/list: returns only conversations owned by the authenticated user.
- Rename: title only; ownership is checked in the server query and again by RLS.
- Delete: scoped to both the requested conversation ID and verified owner; messages cascade-delete with their conversation.

## Usage

### `GET /api/usage?from=...&to=...`
Returns the authenticated user's usage summary and per-model call records. Apply pagination and date-range limits.

## Error format

Use a consistent structure:
```json
{
  "error": {
    "code": "PROVIDER_RATE_LIMITED",
    "message": "This provider is temporarily rate-limiting requests.",
    "retryable": true
  }
}
```

Suggested codes:
- `AUTH_REQUIRED`
- `VALIDATION_ERROR`
- `CONNECTION_NOT_FOUND`
- `CONNECTION_INVALID`
- `MODEL_NOT_ENABLED`
- `MODEL_NOT_ALLOWED`
- `BUDGET_EXCEEDED`
- `PROVIDER_RATE_LIMITED`
- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`
- `PROVIDER_ERROR`
- `RUN_CANCELLED`

Never expose provider secrets or sensitive raw error payloads.
