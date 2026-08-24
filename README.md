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
   npm start        # nodemon on http://localhost:8000
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

## Features

- ✂️ Shorten any long URL (`POST /url`, protected)
- 🔁 Redirect via `/:shortId` with visit tracking (timestamp per click)
- 📊 Per-link analytics (`GET /url/analytics/:shortId`) shown in an inline panel
- 📋 One-click copy for every short link
- 👤 Per-user link lists + stats cards (total links / total clicks / avg)
- 🔒 Passwords hashed with bcrypt, JWT stored in an http cookie
- 🚪 Logout support (`GET /logout`)

Crafted with ❤️ by Ranjay
