# SnapURL — URL Shortener (MERN)

A full-stack URL Shortener built with the MERN stack following the MVC architecture.
Users can register and log in using JWT cookie authentication, create short links,
track clicks per link, and manage only **their own** links.

## Tech

- **Backend** (`backend/`): Node.js, Express 5 JSON API, MongoDB Atlas (Mongoose), JWT cookies, bcryptjs, CORS
- **Frontend** (`frontend/`): React 18 + Vite SPA (React Router), dark themed UI
- **DB:** MongoDB Atlas — connection string stored in `backend/.env`

## Project structure

```
URL_shortener/
├── backend/          # Express JSON API  ->  npm start
│   ├── index.js      # app entry, mounts /api/* + /:shortId redirect
│   ├── controllers/  # url.js, user.js
│   ├── routes/       # url.js, user.js, logs.js (admin)
│   ├── middlewares/  # auth (JWT cookie), admin gate, request logger
│   ├── models/       # mongoose schemas
│   ├── service/      # JWT sign/verify
│   └── .env          # MONGO_URI, PORT=8000, JWT_SECRET, ADMIN_EMAIL, CLIENT_URL
├── frontend/         # React + Vite SPA    ->  npm run dev
│   ├── src/pages/    # Home, Login, Signup, Logs (+ shared components/styles)
│   └── .env          # VITE_API_URL=http://localhost:8000
└── legacy_ejs_app/   # old EJS monolith (kept for reference)
```

## Setup

1. Install dependencies for both apps (from the project root):

   ```
   npm run install-all
   ```

2. Configure the two `.env` files:

   **`backend/.env`**
   ```
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.fnb8834.mongodb.net/urlshortner?appName=Cluster0
   PORT=8000
   JWT_SECRET=your_secret_here
   ADMIN_EMAIL=panditranjay33@gmail.com
   CLIENT_URL=http://localhost:5173
   ```

   **`frontend/.env`**
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start the **backend API**:

   ```
   cd backend
   npm start        # node index.js on http://localhost:8000
   # or: npm run dev  (nodemon auto-restart)
   ```

4. In a second terminal, start the **frontend**:

   ```
   cd frontend
   npm run dev      # Vite dev server on http://localhost:5173
   ```

5. Open http://localhost:5173 — you'll be redirected to `/signup`.
   Create an account and start shortening!

> Tip: from the project root you can also run `npm start` (backend) and
> `npm run dev` (frontend) without cd-ing into the folders.

## Deploy on Render (one URL for everything)

The Express server automatically serves the built React app from
`frontend/dist`, so a single Render **Web Service** hosts the UI, the JSON
API and the `/:shortId` redirects together — no CORS, no cross-site cookies.

A `render.yaml` blueprint is included, so the fastest path is:

1. Push this repo to GitHub.
2. On [dashboard.render.com](https://dashboard.render.com): **New + → Blueprint** → pick this repo.
3. Paste your MongoDB Atlas connection string when prompted for `MONGO_URI`.
   (In Atlas → Network Access, allow `0.0.0.0/0` so Render's servers can connect.)
4. Click **Deploy**. One URL serves everything.

<details>
<summary>Manual setup (without the blueprint)</summary>

| Setting       | Value                                  |
| ------------- | -------------------------------------- |
| Type          | **Web Service** (Node)                 |
| Build Command | `npm run install-all && npm run build` |
| Start Command | `npm start`                            |

Environment variables (the `.env` files are git-ignored, so these MUST be set
in the Render dashboard):

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — any long random string (or let Render generate one)
- `ADMIN_EMAIL` — email that unlocks the `/logs` page
</details>

Important notes:

- **Do not** create a *Static Site* for the frontend — a static site cannot
  serve the API or follow redirects, which breaks the app.
- **Do not** set `NODE_ENV=production` as an env var: the build step needs the
  frontend dev-dependencies (Vite). Render injects `RENDER=true` on its own,
  which already switches cookies/CORS into production mode.
- If you previously deployed the two-service split (static frontend +
  separate backend), you can delete both after the new single service works.

## Features

- ✂️ Shorten any long URL (`POST /url`, protected)
- 🔁 Redirect via `/:shortId` with visit tracking (timestamp per click)
- 📊 Per-link analytics (`GET /url/analytics/:shortId`) shown in an inline panel
- 📋 One-click copy for every short link
- 👤 Per-user link lists + stats cards (total links / total clicks / avg)
- 🔒 Passwords hashed with bcrypt, JWT stored in an http cookie
- 🚪 Logout support (`GET /logout`)

Crafted with ❤️ by Ranjay
