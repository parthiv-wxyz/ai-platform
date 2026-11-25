# Proposed Data Model

This is a logical starting point, not a final migration. Review Supabase Auth integration and RLS behavior before implementing.

## Entities

### `profiles`
- `id` UUID, primary key, references `auth.users.id`.
- `display_name` nullable text.
- `created_at`, `updated_at` timestamps.

### `provider_connections`
- `id` UUID primary key.
- `user_id` UUID, references `profiles.id`.
- `provider` text / enum (`openai`, `anthropic`, `google`, etc.).
- `label` text.
- `credential_ciphertext` text or bytea.
- `credential_nonce` bytea / encoded text.
- `credential_key_version` text.
- `status` (`active`, `invalid`, `revoked`, `needs_reauth`).
- `created_at`, `updated_at`, `last_validated_at`.
- Unique constraint should prevent duplicate connection identity where appropriate.

Never store plaintext API keys. Never return ciphertext or credential metadata that could reveal a secret to the client.

### `user_model_preferences`
- `id` UUID.
- `user_id` UUID.
- `provider_connection_id` UUID.
- `model_id` text.
- `enabled` boolean.
- `allow_paid` boolean.
- `priority` integer.
- `max_output_tokens` integer nullable.
- `created_at`, `updated_at`.

### `conversations`
- `id` UUID.
- `user_id` UUID.
- `title` text.
- `created_at`, `updated_at`.

### `messages`
- `id` UUID.
- `conversation_id` UUID.
- `user_id` UUID.
- `role` (`user`, `assistant`, `system`).
- `content` text or structured JSON.
- `created_at`.

Do not store provider secrets in messages. Avoid persisting hidden reasoning. Store only user-visible output and necessary execution metadata.

### `runs`
- `id` UUID.
- `user_id` UUID.
- `conversation_id` UUID.
- `status` text.
- `task_type` text nullable.
- `execution_mode` (`single`, `review`, `compare`, `debate`, `workflow`).
- `budget_input_tokens` integer nullable.
- `budget_output_tokens` integer nullable.
- `budget_cost_microunits` bigint nullable, with currency metadata if cost budgeting is implemented.
- `reserved_budget` JSONB nullable.
- `stop_reason` text nullable.
- `created_at`, `completed_at`.

### `model_calls`
- `id` UUID.
- `run_id` UUID.
- `user_id` UUID.
- `provider` text.
- `model_id` text.
- `call_role` (`primary`, `reviewer`, `judge`, `specialist`, `synthesis`).
- `status` text.
- `input_tokens` integer nullable.
- `output_tokens` integer nullable.
- `cached_input_tokens` integer nullable.
- `estimated_cost` numeric nullable.
- `currency` text nullable.
- `latency_ms` integer nullable.
- `error_code` text nullable.
- `created_at`, `completed_at`.

### `usage_events`
- `id` UUID.
- `user_id` UUID.
- `run_id` UUID nullable.
- `model_call_id` UUID nullable.
- `event_type` text.
- `metadata` JSONB with allowlisted, non-secret fields only.
- `created_at`.

## Relationships

- One profile has many provider connections.
- One profile has many conversations.
- One conversation has many messages and runs.
- One run has many model calls.
- A model call belongs to one user and one run.

## Database security requirements

- Enable RLS on every user-owned table.
- Policies must bind ownership to `auth.uid()`.
- Do not rely on client-provided `user_id`.
- Service-role access must remain server-side and narrowly scoped.
- Credential reads should go through a dedicated server-side security module.
- Never expose credential ciphertext through general profile/provider list endpoints.
- Add tests proving user A cannot read or mutate user B's records.

## Retention

Provide user controls to delete conversations and provider connections. Define whether usage records are deleted, anonymized, or retained for operational/security reasons before public launch. Explain the policy in the product.
