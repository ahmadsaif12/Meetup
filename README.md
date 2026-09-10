# Meetup — Video Conferencing App

Meetup is a full-stack, real-time video-conferencing application with HD peer-to-peer calls, screen-ready meeting rooms, in-meeting chat, participant management, and monthly usage-based plans. It uses **WebRTC** for media, **Socket.IO** for signaling, and **Clerk** for authentication — all backed by a **Neon (Postgres)** database.

![Stack](https://img.shields.io/badge/React-19-blue) ![Stack](https://img.shields.io/badge/Vite-8-purple) ![Stack](https://img.shields.io/badge/Express-5-green) ![Stack](https://img.shields.io/badge/Socket.IO-4-black) ![Stack](https://img.shields.io/badge/TailwindCSS-v4-blue)

## ✨ Features

- **HD video meetings** — adaptive HD camera/microphone constraints with echo cancellation & noise suppression
- **Peer-to-peer WebRTC** — STUN-based direct media between participants (no TURN required)
- **Instant meetings** — create a meeting with one click, share the one-tap link
- **Join by code** — paste a meeting code to hop into any running room
- **In-meeting chat** — full-height chat panel with unread badges, persisted to the database
- **Participant list** — live member list with host crown, mic/camera status
- **Host controls** — the host can end the meeting for everyone
- **Live call timer / meeting ID** — copy the meeting link instantly
- **Sessions history** — review past meetings with full details
- **Plans & usage** — Free (30 meetings/month) vs Premium (unlimited), synced via Clerk webhooks
- **Clerk authentication** — secure sign-in, user provisioning, user profile menu
- **Dark immersive meeting UI** — polished, glassy, responsive layout

## 📁 Project Structure

```text
VideoConferencing/
├── backend/                 # Express + Socket.IO server
│   ├── config/db.js         # Neon (Postgres) client + cold-start retry helper
│   ├── controllers/         # meetings, stats, sessions, Clerk webhooks
│   ├── middleware/auth.js   # Clerk JWT protection → auto-provisions users
│   ├── routes/meetingRoutes.js
│   ├── services/            # billing + user provisioning
│   ├── socket.js            # Socket.IO signaling + realtime events
│   └── server.js            # app entrypoint (HTTP + Socket.IO)
│
└── frontend/                # React (Vite) SPA
    ├── config/              # axios api + socket.io client (singleton)
    ├── src/components/      # Navbar, Footer, meeting/*, sessions/*
    ├── src/hooks/           # useWebRTC (peer-to-peer), useChat
    ├── src/pages/           # Login, Dashboard, MeetingRoom, Session, Pricing
    └── src/config/          # styling (Tailwind v4 theme)
```

## 🚀 Getting Started

> Requirements: **Node.js ≥ 20**, a **Clerk** application, and a **Neon** Postgres database.

### 1. Clone & install

```bash
git clone <repo-url> VideoConferencing
cd VideoConferencing

# backend
cd backend && npm install

# frontend
cd ../frontend && npm install
```

### 2. Environment variables

Create `.env` files (both are git-ignored):

**`backend/.env`**

```env
DATABASE_URL=postgresql://...
ORIGINS=http://localhost:5173,http://localhost:3000
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

**`frontend/.env`**

```env
VITE_PUBLISHABLE_KEY=pk_test_...
VITE_BASE_URL=http://localhost:3000
```

> **Clerk setup:** In your Clerk dashboard create the `user.created`, `user.updated`, and `user.deleted` webhooks pointing at `http://localhost:3000/api/clerk`. The signing secret must match.

### 3. Run

```bash
# terminal 1 — backend (port 3000)
cd backend && npm run server

# terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open **http://localhost:5173**, sign in with Clerk, and start a meeting. Share the link/code with a friend to test two-way HD calls, chat, and host-end.

### 4. Build for production

```bash
cd frontend && npm run build    # → frontend/dist
cd backend && npm start         # → serve API + Socket.IO on :3000
```

## 🔌 API Overview

All routes are behind Clerk JWT auth (`Authorization: Bearer <token>`).

| Method | Endpoint                      | Description                              |
| ------ | ----------------------------- | ---------------------------------------- |
| POST   | `/api/meetings`               | Create a meeting (enforces plan limits)  |
| GET    | `/api/meetings/stats`         | Dashboard stats, plan & recent meetings  |
| GET    | `/api/meetings/user/sessions` | Past/future meetings for the current user|
| GET    | `/api/meetings/session/:id`   | Full session details                     |
| GET    | `/api/meetings/:meetingId`    | Fetch a single meeting by public code    |
| POST   | `/api/clerk`                  | Clerk webhook (syncs users & plans)      |

## ⚡ Socket.IO Events

| Client → Server | Server → Client   | Purpose                        |
| --------------- | ----------------- | ------------------------------ |
| `join-room`     | `room-members`, `user-joined` | Enter a meeting room   |
| `offer` / `answer` | —              | WebRTC SDP signaling           |
| `ice-candidate` | —                 | WebRTC network candidates      |
| `chat-message`  | `chat-message`    | Persisted in-meeting chat      |
| `toggle-audio` / `toggle-video` | `user-audio-toggled` / `user-video-toggled` | Media status |
| `end-meeting`   | `meeting-ended`   | Host ends meeting for everyone |
| `leave-room` / `disconnect` | `user-left` | Leave/cleanup a room     |

## 🗄️ Database (auto-created on boot)

- `users` — Clerk users plus plan (`free` / `premium`)
- `meetings` — active/ended meetings with host
- `meeting_participants` — join/leave audit log
- `meeting_messages` — chat history per meeting

Neon's free tier suspends idle databases; `queryWithRetry` in `backend/config/db.js` keeps reads and idempotent writes resilient during cold-start wake-ups.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Clerk React, Socket.IO client, React Router, Axios, lucide-react, react-hot-toast
- **Backend:** Node.js, Express 5, Socket.IO 4, @neondatabase/serverless, Clerk Express
- **Realtime:** WebRTC (peer connections) + Socket.IO signaling

## 🤝 Contributing

1. Fork the repo and create a feature branch
2. Keep code style consistent (the repo uses `oxlint`)
3. Test with `cd frontend && npm run lint` and `npm run build`
4. Open a pull request with a clear description

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).