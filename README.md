# 🚀 RCO-IDE — Real-Time Collaborative Online IDE

![RCO-IDE Banner](https://user-images.githubusercontent.com/placeholder/1200x200.png)

A modern, collaborative, cloud-friendly code workspace built for teaching and pair-programming. RCO-IDE brings together the Monaco editor, real-time synchronization, versioned snapshots, and secure remote code execution — all in a sleek, responsive interface.

---

## ✨ Key Features

- 🧩 MERN Architecture — MongoDB, Express, React (Vite), Node.js for a performant full-stack experience.
- 🖥️ Monaco Editor — Integrated Monaco (VS Code) editing experience with language-aware features.
- ⚡ Live Collaboration — Socket.io powers live cursors, real-time edits, and presence for low-latency teamwork.
- 🗂️ Snapshot Versioning — Save and restore code snapshots backed by MongoDB for session history and recovery.
- 🔒 Secure Execution Proxy — Server-forwarded JDoodle integration for sandboxed code execution.
- 🎛️ Role-based UX — Instructor and Student roles with privileges for session control and snapshot restores.

---

## 🛠️ Tech Stack

- Frontend
  - React (Vite)
  - Redux (auth)
  - Monaco Editor (`@monaco-editor/react`)
  - Socket.IO client
  - Tailwind-like utility styling
- Backend
  - Node.js + Express
  - Socket.IO server
  - MongoDB / `mongodb-memory-server` (development fallback)
  - Mongoose for data models
  - JDoodle HTTP proxy for code execution
- APIs
  - REST endpoints under `/api/*` for auth, rooms, snapshots
  - Socket.IO events for `code-change`, `cursor-change`, `snapshot-saved`, `room-users`

---

## ⚙️ Local Setup Guide

Follow the steps below to run RCO-IDE locally.

Prerequisites:
- Node.js (v18+ recommended)
- npm
- MongoDB Atlas URI (or local MongoDB for production-like testing)
- JDoodle account (Client ID & Client Secret) for execution

1) Clone the repo

```bash
git clone <your-repo-url>
cd rco-ide
```

2) Configure server environment

- Copy the example env and fill the values:

Windows (PowerShell):

```powershell
cd server
copy .env.example .env
# then edit .env to add your MONGO_URI, JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET
```

macOS / Linux:

```bash
cd server
cp .env.example .env
# edit .env and add credentials
```

Required `.env` vars (server):

```
MONGO_URI=your_mongo_uri
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

3) Start the backend

```bash
cd server
npm install
npm run dev
```

- The server exposes a health endpoint for quick checks: `GET http://localhost:5000/api/health` (returns `dbReady: true/false`).

4) Start the frontend

```bash
cd ../rco-client
npm install
npm run dev
```

- By default Vite serves the app at `http://localhost:5173`.

5) Visit the app

Open `http://localhost:5173` in your browser, register or login, then create or join a room.

---

## 🚦 Usage & Roles

RCO-IDE includes two common roles with different privileges:

- Student 🧑‍🎓
  - Join sessions via Room ID.
  - Edit code collaboratively and view live cursors from peers.
  - Create snapshots (if enabled) for personal backups.
  - Can run code in the terminal (execution requests are forwarded to the server).

- Instructor 🧑‍🏫
  - Create and manage coding sessions.
  - Save snapshots and **restore** snapshots for the whole room.
  - Restore privileges are granted to:
    - Users with the `instructor` role.
    - The room creator (owner).
  - Instructors can use snapshots to roll back sessions during demos, grading, or recovery.

Restoring Snapshots — policy summary:
- When an instructor (or room owner) restores a snapshot, the restored code is broadcast to all participants via Socket.IO (`code-change`).
- Students cannot forcibly restore snapshots for the whole room unless they are the room owner or have the `instructor` role.

---

## 🧪 Development Notes & Tips

- Code Execution: The server proxies execution requests to JDoodle. Ensure your JDoodle credentials are set in `server/.env`. Do NOT commit credentials to source control.
- DB Fallback: If MongoDB is not reachable, development uses an in-memory MongoDB as a fallback — this is convenient for local testing but not for production.
- Linting: The client uses ESLint — run `cd rco-client && npm run lint`.

---

## 📦 Production & Deployment

- Build the client: `cd rco-client && npm run build`.
- Serve the built frontend with a static host (Netlify, Vercel, or serve from Express).
- Configure environment variables in your hosting / server environment (Atlas URI + JDoodle credentials + CLIENT_URL).

---

## 🤝 Contributing

Contributions are welcome! Open issues or PRs for bugs, new features, or UX improvements. Keep secrets out of PRs and use environment variables for credentials.

---

## 📬 Contact

Created with ❤️ for teaching and collaborative coding. For questions or demos, reach out via your preferred contact method.

---

Thank you for using RCO-IDE — build, teach, and collaborate faster. 🎉
