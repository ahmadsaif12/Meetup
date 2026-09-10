import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { handleClerkWebhook } from "./controllers/webhookController.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import http from "http";
import { Server } from "socket.io";
import { setupSocketIO } from "./socket.js";

const app = express();
const server = http.createServer(app)

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
const io = new Server(server,{
  cors :{origin : allowedOrigins, credentials: true}
})

setupSocketIO(io)

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(`[Error] ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Start server (use http server so Socket.IO shares the port)
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
