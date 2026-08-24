// ================= REQUEST LOGGER =================
// Logs every incoming request (IP + time + method + URL)
// into server_logs.txt — powers the /logs and /download pages.
const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "..", "server_logs.txt");

function requestLogger(req, res, next) {
  // x-forwarded-for is useful when behind a proxy; otherwise use socket IP.
  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress;

  const timestamp = new Date().toISOString();

  const logEntry = `IP: ${clientIP} | Time: ${timestamp} | ${req.method} | URL: ${req.url}\n`;

  console.log(logEntry.trim());

  // non-blocking append so logging never slows down responses
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error("Error writing to log file:", err.message);
  });

  next();
}

module.exports = { requestLogger, LOG_FILE };
