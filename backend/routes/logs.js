// ================= SERVER LOGS ROUTES (admin only) =================
const express = require("express");
const fs = require("fs");

const router = express.Router();
const { adminOnly } = require("../middlewares/admin");
const { LOG_FILE } = require("../middlewares/logger");

// view logs as JSON
router.get("/", adminOnly, (req, res) => {
  let content = "";
  try {
    content = fs.readFileSync(LOG_FILE, "utf8");
  } catch (err) {
    content = ""; // log file doesn't exist yet
  }
  const lines = content.split("\n").filter(Boolean).reverse(); // newest first
  return res.json({
    lines,
    total: lines.length,
    adminEmail: req.user.email,
  });
});

// download server_logs.txt as a file
router.get("/download", adminOnly, (req, res) => {
  // make sure the file exists before streaming
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, "");
  }
  res.setHeader("Content-Disposition", 'attachment; filename="server_logs.txt"');
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  fs.createReadStream(LOG_FILE).pipe(res);
});

// wipe the log file
router.get("/clear", adminOnly, (req, res) => {
  fs.writeFile(LOG_FILE, "", () => {});
  return res.json({ ok: true });
});

module.exports = router;
