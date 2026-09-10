import { sql, queryWithRetry } from "../config/db.js";

// Make sure a Clerk user has a row in our users table so FK inserts into
// meetings, meeting_participants and meeting_messages never fail.
// Idempotent + safe to call on every request. Email falls back to an
// id-based address so the NOT NULL UNIQUE constraint is never violated.
// On conflict we only sync the (better) real name, never overwrite a
// genuine email address.
export const ensureUserExists = async ({ id, name, email }) => {
  if (!id) return null;
  return queryWithRetry(() => sql`
    INSERT INTO users (id, name, email, plan)
    VALUES (
      ${id},
      ${name || "User"},
      ${email || `${id}@clerk.local`},
      'free'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(NULLIF(excluded.name, 'User'), users.name),
      updated_at = NOW()
  `);
};