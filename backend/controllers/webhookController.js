import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";

// Extract the Clerk user (or org) id from any billing payload
const getPayerId = (data) => {
  const payer = data.payer || {};
  return (
    payer.user_id ||
    payer.organization_id ||
    data.payer_id ||
    data.user_id ||
    data.user?.id ||
    null
  );
};

// Map Clerk billing state to our plan values ('free' | 'premium')
// slug 'free' is Clerk's default plant; everything else counts as paid
const resolvePlan = ({ status, slug }) => {
  if (status === "active" && slug && slug !== "free") return "premium";
  return "free";
};

export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    const { type: eventType, data } = evt;

    switch (eventType) {
      // ── User management ─────────────────────────────────
      case "user.created": {
        const userId = data.id;
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || "user"} ${data.last_name || ""}`.trim();
        const image = data.image_url || "";

        await sql`
          INSERT INTO users (id, name, email, image, plan)
          VALUES (${userId}, ${name}, ${email}, ${image}, 'free')
          ON CONFLICT (email) DO UPDATE SET
            id = excluded.id,
            name = excluded.name,
            image = excluded.image,
            plan = excluded.plan,
            updated_at = NOW()
        `;
        break;
      }

      case "user.updated": {
        const userId = data.id;
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || "user"} ${data.last_name || ""}`.trim();
        const image = data.image_url || "";

        await sql`
          UPDATE users SET
            name = ${name},
            email = ${email},
            image = ${image},
            updated_at = NOW()
          WHERE id = ${userId}
        `;
        break;
      }

      case "user.deleted": {
        const userId = data.id;
        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }

      // ── Clerk Billing: top-level subscription events ────
      // cargo naming: subscription.created | subscription.updated
      //               | subscription.active | subscription.pastDue
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.pastDue": {
        const userId = getPayerId(data);
        if (!userId) {
          console.warn(`[Webhook] ${eventType}: no payer in payload`, data);
          break;
        }

        const status = data.status || "incomplete";
        const items = Array.isArray(data.items) ? data.items : [];

        // A user is premium when at least one paid plan item is active
        const hasActivePaidPlan = items.some(
          (item) =>
            item?.status === "active" &&
            item?.plan?.slug &&
            item.plan.slug !== "free"
        );

        const newPlan =
          (status === "active" && hasActivePaidPlan) ? "premium" : "free";

        console.log(
          `[Webhook] ${eventType}: user=${userId}, status=${status}, plan=${newPlan}`
        );

        await sql`
          UPDATE users SET plan = ${newPlan}, updated_at = NOW()
          WHERE id = ${userId}
        `;
        break;
      }

      // ── Clerk Billing: subscription item events ─────────
      // data IS the item: { payer, plan: { slug }, status, ... }
      case "subscriptionItem.created":
      case "subscriptionItem.updated":
      case "subscriptionItem.active":
      case "subscriptionItem.canceled":
      case "subscriptionItem.upcoming":
      case "subscriptionItem.ended":
      case "subscriptionItem.abandoned":
      case "subscriptionItem.incomplete":
      case "subscriptionItem.pastDue":
      case "subscriptionItem.expired":
      case "subscriptionItem.freeTrialEnding": {
        const userId = getPayerId(data);
        if (!userId) {
          console.warn(`[Webhook] ${eventType}: no payer in payload`, data);
          break;
        }

        const newPlan = resolvePlan({
          status: data.status,
          slug: data.plan?.slug,
        });

        console.log(
          `[Webhook] ${eventType}: user=${userId}, status=${data.status}, plan=${newPlan}`
        );

        await sql`
          UPDATE users SET plan = ${newPlan}, updated_at = NOW()
          WHERE id = ${userId}
        `;
        break;
      }

      // ── Clerk Billing: payment confirmation ─────────────
      case "paymentAttempt.updated": {
        const userId = getPayerId(data);
        if (!userId) {
          break;
        }

        // A paid checkout grants premium even if item sync lags
        if (data.status === "paid") {
          await sql`
            UPDATE users SET plan = 'premium', updated_at = NOW()
            WHERE id = ${userId}
          `;
          console.log(`[Webhook] paymentAttempt.updated: user=${userId} → premium`);
        } else if (data.status === "failed") {
          // Keep current plan; failure is transient during checkout
          console.log(
            `[Webhook] paymentAttempt.updated: user=${userId} payment ${data.status}`
          );
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${eventType}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    res.status(400).json({ success: false });
  }
};