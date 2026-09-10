import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";

// Handle Clerk webhook events for user management
export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    const { type: eventType, data } = evt;

    switch (eventType) {
      // New user registered
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

      // User profile updated
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

      // User deleted
      case "user.deleted": {
        const userId = data.id;
        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }

      default:
        console.log(`Unhandled Clerk webhook event: ${eventType}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ success: false });
  }
};
