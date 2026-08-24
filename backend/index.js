require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { connectToMongoDB } = require("./connect");
const { restrictToLoggedInUserOnly } = require("./middlewares/auth");
const { requestLogger } = require("./middlewares/logger");

const URL = require("./models/url");

// routes
const urlRoute = require("./routes/url");
const UserRoute = require("./routes/user");
const logRoute = require("./routes/logs");

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// single-service deployment: if the React app is built into frontend/dist,
// this server also serves the UI -> one URL for everything, no CORS needed.
const FRONTEND_DIST =
  process.env.FRONTEND_DIST || path.join(__dirname, "..", "frontend", "dist");
let hasFrontendBuild = false;
try {
  hasFrontendBuild = fs.existsSync(path.join(FRONTEND_DIST, "index.html"));
} catch {
  /* ignore */
}

// MongoDB Atlas connection string comes from .env
connectToMongoDB(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB (Atlas) is connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

// allow the React frontend (different port) to call this API with cookies
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// built in middleware // to parse json data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// log every request: IP | time | method | URL -> server_logs.txt
app.use(requestLogger);

// simple health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- JSON API ----------
app.use("/api/user", UserRoute); // signup / login / logout
app.use("/api/url", restrictToLoggedInUserOnly, urlRoute); // links (protected)
app.use("/api/logs", logRoute); // server logs (admin only)

// nothing else under /api -> 404 json
app.use("/api", (req, res) => {
  return res.status(404).json({ error: "API route not found" });
});

// ---------- single-service mode: serve the React build ----------
// static assets first, then the known SPA routes so they are NOT treated
// as short ids by the /:shortId redirect below.
if (hasFrontendBuild) {
  app.use(express.static(FRONTEND_DIST));
  app.get(["/", "/index.html", "/login", "/signup", "/logs"], (req, res) => {
    return res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
  console.log(`Serving frontend build from ${FRONTEND_DIST}`);
}

// ---------- short link redirect (works from any origin) ----------
app.get("/:shortId", async (req, res, next) => {
  try {
    const shortId = req.params.shortId;

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: { timestamp: Date.now() },
        },
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    return res.redirect(entry.redirectURL);
  } catch (err) {
    next(err);
  }
});

// central error handler -> always JSON for API consumers
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
