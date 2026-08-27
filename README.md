# SnapURL — URL Shortener (MERN)

https://url-shortener-frontend-eva1.onrender.com/signup

A full-stack URL Shortener built with the MERN stack following the MVC architecture.
Users register and log in with JWT cookie authentication, shorten any long URL,
and track the clicks each of their short links receives — everyone sees only
their **own** links.

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
│   ├── routes/       # url.js, user.js
│   ├── middlewares/  # auth (JWT cookie), request logger
│   ├── models/       # mongoose schemas
│   ├── service/      # JWT sign/verify
│   └── .env          # MONGO_URI, PORT=8000, JWT_SECRET, CLIENT_URL
├── frontend/         # React + Vite SPA    ->  npm run dev
│   ├── src/pages/    # Home, Login, Signup (+ shared components/styles)
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

## What a normal user can do

- **Create an account & sign in** — friendly signup/login pages, the session
  is kept in an httpOnly JWT cookie, and logout is one click away
  (`GET /api/user/logout`)
- **Shorten any long URL** — paste a link into the box on the home page and
  get a clean short link instantly (`POST /api/url`)
- **One-click copy** — every short link has a Copy button right next to it
- **Share & track clicks** — anyone who opens your short link (`/:shortId`)
  is redirected to the destination while the click is recorded with a timestamp
- **Your links, only yours** — the "Your Links" table lists just the links YOU
  created, each with its click count and creation date; you can never see or
  touch another user's links
- **Full-page analytics per link** — clicking Analytics opens a dedicated
  page with **Total Clicks**, the short link itself, and the complete
  **Visit History** (the time of every single click), plus an easy
  **Back to my links** button
- **Stats at a glance** — home-page cards show your total links, total clicks
  and average clicks per link
- **Secure by default** — passwords are hashed with bcrypt and every data
  request is scoped strictly to your account



Crafted with care by Ranjay
