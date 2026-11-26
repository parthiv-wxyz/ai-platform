# Supabase Setup

Milestone 1 uses Supabase Auth and Postgres with the public project URL and publishable key only. The application does not use the service-role key.

## Dashboard setup

1. Create a Supabase project.
2. In **Authentication → Providers**, enable Email and password authentication.
3. In **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` for local development and add these redirect URLs:
   - `http://localhost:3000/auth/confirm`
   - your deployed app's `/auth/confirm` URL
4. Decide whether email confirmation is required. For production, configure SMTP and keep confirmation enabled.
5. Copy the project URL and publishable key into `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   ```

6. Apply `supabase/migrations/202611260001_auth_and_conversations.sql` using the Supabase CLI or SQL Editor.

## Required verification

Use two separate test accounts after applying the migration:

1. Sign up and confirm User A; create a conversation.
2. Sign in as User B in a separate browser profile.
3. Confirm User B cannot see, open, rename, or delete User A's conversation, including when using a copied conversation URL.
4. Confirm an unauthenticated request to `/dashboard` redirects to `/sign-in`.
5. Run the RLS test plan in `supabase/tests/conversation_rls.sql` with the Supabase CLI before deploying.

The public publishable/anon key is intentionally browser-visible. Never add `SUPABASE_SERVICE_ROLE_KEY` to client code, `.env.example`, logs, or tests.
