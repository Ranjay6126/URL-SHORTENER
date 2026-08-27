# SnapURL - My URL Shortener Project

Live site: https://url-shortener-frontend-eva1.onrender.com/

Hey! This is my first full-stack project. It's a URL shortener made with MERN stack.
You can signup/login, make short links from long ones, and check how many people clicked them.
Each user can only see their own links, don't worry.


## What I used

Backend: Node.js with Express 5, MongoDB (mongoose), JWT for auth in cookies, bcrypt for passwords
Frontend: React 18 + Vite, React Router, dark theme UI
Database: MongoDB Atlas. I put the connection string in backend/.env


## How to run it locally

1. First install everything. Go to project root and type:
   ```
   npm run install-all
   ```

2. Make two .env files:

   **backend/.env**
   ```
   MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.fnb8834.mongodb.net/urlshortner?appName=Cluster0
   PORT=8000
   JWT_SECRET=put_any_random_string_here
   CLIENT_URL=http://localhost:5173
   ```

   **frontend/.env**
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start backend first:
   ```
   cd backend
   npm start
   ```
   It runs on port 8000 with nodemon.

4. Open another terminal for frontend:
   ```
   cd frontend
   npm run dev
   ```
   Runs on port 5173.

5. Now open http://localhost:5173 in browser. It will take you to signup page.
   Make an account and start making short links!

Tip: You can also run `npm start` and `npm run dev` from root folder without cd.

---

## Features

- Signup / Login pages. Uses JWT in httpOnly cookie so it's secure. Logout with one click.
- Paste any long URL, get a short one instantly
- Copy button next to each short link (so you don't have to select manually)
- When someone clicks your short link, they get redirected and a click is saved with time
- You can only see YOUR links in the table, with clicks count and date
- Click "Analytics" on any link to see full visit history with timestamps
- Home page shows cards: total links, total clicks, avg clicks per link
- Passwords are hashed with bcrypt so even if db leaks they are safe

created by Ranjay
