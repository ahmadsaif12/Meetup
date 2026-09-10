import { getAuth } from "@clerk/express";
import { sql, queryWithRetry } from "../config/db.js";
import { ensureUserExists } from "../services/userService.js";

// Auth middleware: validates the Clerk session, then attaches the
// user id and current plan (from our DB) to req.user.
export const protect = async (req, res, next) => {
  const auth = getAuth(req);
  const userId = auth?.userId || req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not Authorized" });
  }

  try {
    // Ensure the Clerk user has a row in our DB (FK target for meetings/participants)
    await ensureUserExists({ id: userId });

    const users = await queryWithRetry(() => sql`
      SELECT plan FROM users WHERE id = ${userId}
    `);

    req.user = {
      id: userId,
      plan: users[0]?.plan || "free",
    };

    next();
  } catch (error) {
    console.error("[Auth] Failed to load user:", error.message);
    res.status(500).json({ error: error.message });
  }
};