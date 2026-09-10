import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const sql = neon(process.env.DATABASE_URL);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Errors from a transient network blip or Neon compute cold-start wake-up.
const isTransient = (error) => {
  const msg = error?.message || "";
  return (
    msg.includes("fetch failed") ||
    msg.includes("Error connecting to database") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("socket hang up")
  );
};

// Retry an idempotent query (safe: CREATE TABLE IF NOT EXISTS, plain reads)
export async function queryWithRetry(fn, attempts = 5, baseDelayMs = 1000) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isTransient(error) || attempt === attempts) throw error;
      console.warn(
        `[DB] connection error, retrying (${attempt}/${attempts}): ${error.message}`
      );
      await sleep(baseDelayMs * attempt);
    }
  }
}

// Create all tables if they don't exist
export async function initDB() {
  try {
    await queryWithRetry(async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          image VARCHAR(500),
          plan VARCHAR(20) DEFAULT 'free',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS meetings (
          id SERIAL PRIMARY KEY,
          meeting_id VARCHAR(50) NOT NULL UNIQUE,
          title VARCHAR(255) DEFAULT 'Instant Meeting',
          host_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          status VARCHAR(20) DEFAULT 'active',
          ended_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS meeting_participants (
          id SERIAL PRIMARY KEY,
          meeting_id INT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE ON UPDATE CASCADE,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
          name VARCHAR(255) NOT NULL,
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          left_at TIMESTAMPTZ
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS meeting_messages (
          id SERIAL PRIMARY KEY,
          meeting_id INT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE ON UPDATE CASCADE,
          sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
          sender_name VARCHAR(255) NOT NULL,
          text TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `;
    });
  } catch (error) {
    console.error("Error initializing database tables:", error);
    throw error;
  }
}