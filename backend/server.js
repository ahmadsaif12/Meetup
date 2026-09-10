import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { handleClerkWebhook } from "./controllers/webhookController.js";
import meetingRoutes from "./routes/meetingRoutes.js";

const app = express();

// Initialize database tables
try {
  await initDB();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Failed to initialize database, server will start anyway:", error.message);
}

// Middleware
const allowedOrigins = process.env.ORIGINS.split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

// Clerk webhook (raw body needed for signature verification)
app.use("/api/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);

app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => {
  res.send("Api is Live");
});

app.use("/api/meetings", meetingRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
