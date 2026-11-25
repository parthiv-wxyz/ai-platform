# Provider Integration Guide

## 1. Provider-neutral rule

All provider-specific code belongs behind adapters. The rest of the application uses normalized domain contracts.

## 2. Initial providers

Potential initial integrations:
- OpenAI API
- Google Gemini API
- Anthropic API

Provider support, model names, authorization options, rate limits, regional availability, and pricing change. Verify official current documentation before coding each integration.

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

## 4. Normalized request

A provider request should contain:
- `model`
- `messages`
- `maxOutputTokens`
- `temperature` where supported
- `stream` where supported
- optional structured output configuration
- optional provider-specific options behind a typed extension

Do not assume all providers support all fields.

## 5. Normalized response

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

## 6. Capability registry

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

## 7. Error normalization

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

## 8. Adapter tests

For each provider:
- Valid request mapping.
- Invalid credential handling.
- Rate-limit mapping.
- Timeout behavior.
- Usage extraction.
- Streaming event normalization.
- Unsupported capability rejection.
- Secret redaction.
