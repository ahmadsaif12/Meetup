import { clerkClient } from "@clerk/express";
import { sql, queryWithRetry } from "../config/db.js";

// Query Clerk Billing for the user's real subscription and sync the
// resulting plan into our DB. Falls back to the stored DB plan if the
// Clerk Billing API is unavailable (e.g. billing not enabled yet).
export async function syncUserPlan(userId) {
  try {
    const subscription =
      await clerkClient.billing.getUserBillingSubscription(userId);

    let newPlan = "free";

    if (subscription) {
      const items = subscription.subscriptionItems || [];
      const hasActivePaidPlan = items.some(
        (item) =>
          item?.status === "active" &&
          item?.plan?.slug &&
          item.plan.slug !== "free"
      );

      if (subscription.status === "active" && hasActivePaidPlan) {
        newPlan = "premium";
      }

      console.log(
        `[Billing] user=${userId}, subStatus=${subscription.status}, plan=${newPlan}`
      );
    } else {
      console.log(`[Billing] user=${userId}: no subscription → free`);
    }

    await queryWithRetry(() => sql`
      UPDATE users SET plan = ${newPlan}, updated_at = NOW()
      WHERE id = ${userId}
    `);

    return newPlan;
  } catch (error) {
    console.warn("[Billing] Clerk API unavailable, using DB plan:", error.message);
    const users = await queryWithRetry(() => sql`
      SELECT plan FROM users WHERE id = ${userId}
    `);
    return users[0]?.plan || "free";
  }
}