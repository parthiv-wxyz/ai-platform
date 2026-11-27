# Provider Integration Guide

## 1. Provider-neutral rule

All provider-specific code belongs behind adapters. The rest of the application uses normalized domain contracts.

## 2. Initial providers

The coding platform supports Google Gemini through its free API tier, Qwen3-Coder locally through Ollama, and MockProvider for deterministic development and testing. Paid API inference is not supported.

Provider support, model names, authorization options, rate limits, regional availability, and free-tier terms change. Verify official current documentation before enabling each integration.

Google Gemini is implemented through the official `@google/genai` SDK. The default path makes one provider call per chat submission; model and output-token limits are validated server-side, with no automatic fallback or hidden retry.

The only externally connectable provider is `google`; Ollama is a local provider and does not store an API credential. The server retrieves the authenticated owner's encrypted Gemini credential or calls the local Ollama HTTP server through the shared provider registry. The server-side eligibility registry enables `gemini-3.5-flash-lite` as a free-tier model and `qwen3-coder` as a local no-quota model, with each limitation recorded.

For local Qwen, install Ollama, pull the configured model (`ollama pull qwen3-coder`), and keep the Ollama service running at `OLLAMA_BASE_URL`. “No quota” means no provider API quota or API billing; inference remains limited by the user's local CPU, GPU, memory, and model size.

## 3. Credential modes

Support only provider-approved methods:
1. User-provided API key.
2. Official OAuth / delegated authorization if the provider offers an applicable third-party flow.
3. Other provider-documented account linking where explicitly permitted.

Do not:
- Ask users for their provider website password.
- Store consumer account cookies.
- Automate provider websites to reuse consumer chat subscriptions.
- Claim that ChatGPT Plus / Claude Pro / consumer plans automatically include API usage.
- Circumvent provider quotas, rate limits, or billing.

## 4. Coding request context

Coding requests should carry the task type and only the relevant context:

- task type from the coding taxonomy;
- source files or focused excerpts;
- compiler, test, or runtime errors for debugging;
- requirements and acceptance criteria for generation and test tasks;
- repository structure and dependency metadata for codebase analysis.

Do not send an entire repository by default. Redact secrets and unrelated personal data before provider calls.

## 5. Normalized request

A provider request should contain:
- `model`
- `messages`
- `maxOutputTokens`
- `temperature` where supported
- `stream` where supported
- optional structured output configuration
- optional provider-specific options behind a typed extension

Do not assume all providers support all fields.

## 6. Normalized response

Return:
- `content`
- `provider`
- `model`
- `finishReason` where available
- `usage.inputTokens` where available
- `usage.outputTokens` where available
- `usage.cachedInputTokens` where available
- `requestId` where safe
- `latencyMs`
- `warnings`

Use `null` / unavailable rather than fabricating missing usage.

## 7. Capability registry

For each model, track:
- Provider and model identifier.
- Text input / output support.
- Vision support.
- Tool calling support.
- Structured output support.
- Streaming support.
- Context window (verified value).
- Maximum output tokens (verified value).
- Availability status.
- Pricing metadata and last verified date.

Do not hardcode stale pricing into routing logic. A model's capabilities must be verified against official provider docs.

## 8. Error normalization

Map provider errors to internal codes:
- authentication invalid
- quota exhausted
- rate limited
- model unavailable
- request invalid
- timeout
- provider unavailable
- unknown provider error

Preserve a safe diagnostic code and provider request ID where available. Redact raw payloads and secrets.

## 9. Adapter tests

For each provider:
- Valid request mapping.
- Invalid credential handling.
- Rate-limit mapping.
- Timeout behavior.
- Usage extraction.
- Streaming event normalization.
- Unsupported capability rejection.
- Secret redaction.
- Coding-task compatibility and local-provider availability behavior.

## 10. Local provider setup

Add a Gemini API key through the authenticated **Provider connections** screen. It is encrypted with AES-256-GCM before persistence and never returned after saving. Set `AI_CREDENTIAL_ENCRYPTION_KEY` to a random 32-byte hex value and keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Apply the provider migration after the authentication/conversations migration.
