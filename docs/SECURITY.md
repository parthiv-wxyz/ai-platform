# Security Requirements

Security is a launch blocker, especially because users supply their own provider credentials.

## 1. Credential handling
- Accept API keys only over HTTPS.
- Never request a provider's consumer website password.
- Never put API keys in local storage, session storage, cookies readable by JavaScript, URLs, analytics, or client logs.
- Encrypt credentials before database persistence using authenticated encryption (e.g. AES-256-GCM) and a key held outside the database.
- Keep encryption keys in deployment secret configuration, not in source control.
- Include key versioning to support rotation.
- Decrypt only inside the server-side provider adapter at call time.
- Avoid returning credential ciphertext to the client.
- Provide credential deletion and revocation guidance.

For a personal prototype, an environment-managed encryption key may be used. Before public multi-user launch, review key management, rotation, backups, and incident response. Do not mistake application-level encryption for a complete security program.

## 2. Authentication and authorization
- Validate the user session on every protected server route.
- Enforce ownership in the database with RLS.
- Never authorize based only on a client-provided user ID.
- Keep Supabase service-role credentials server-side.
- Use least privilege.

Provider ciphertext columns are not granted to the browser-facing authenticated role. Server code verifies the Supabase session owner first, then uses the server-only service-role client for the minimum credential read needed by the provider adapter. The service-role key is never sent to the browser.

## 3. API security
- Validate request bodies and query parameters.
- Add rate limits to credential, chat, and expensive endpoints.
- Set request size limits and provider timeouts.
- Apply CSRF protections where relevant to the chosen auth/session design.
- Use secure headers and HTTPS.
- Avoid open redirects and unsafe URL fetching.
- Do not allow arbitrary provider base URLs from users (SSRF risk).

## 4. Logging and telemetry
- Redact API keys, authorization headers, prompts where not needed, and sensitive user data.
- Log request IDs, provider, model ID, status, latency, and usage metadata where safe.
- Do not log full provider request/response bodies by default.
- Do not send prompts to third-party analytics.

## 5. Prompt injection and untrusted model output
- Treat model output as untrusted data.
- Do not execute generated code or tool instructions automatically.
- If tools are added later, use explicit allowlists, scoped permissions, and user confirmation for consequential actions.
- Separate system policy from user content.
- Do not allow one agent's output to override application security policy.

## 6. Data protection
- Minimize stored conversation data.
- Provide delete controls.
- Use RLS for every user-owned table.
- Avoid storing hidden reasoning.
- Document data retention and provider data handling.
- Make clear that prompts are sent to the selected external AI provider.

## 7. Pre-launch checklist
- [ ] Threat model reviewed.
- [ ] RLS tested with multiple users.
- [ ] Credential encryption and key rotation tested.
- [ ] No secrets in browser bundle or source maps.
- [ ] No secrets in logs or error messages.
- [ ] Rate limits and request limits enabled.
- [ ] Dependency and secret scanning enabled.
- [ ] Account deletion and credential deletion tested.
- [ ] Provider terms and privacy disclosures reviewed.
