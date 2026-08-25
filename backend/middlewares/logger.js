// ================= REQUEST LOGGER =================
// Logs every incoming request (IP + time + method + URL)
// into server_logs.txt — powers the /logs and /download pages.
const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "..", "server_logs.txt");
const { quickDisplayIp } = require("../service/ip");

// Robust client-IP extraction:
// 1. x-forwarded-for (first hop) when behind a proxy
// 2. x-real-ip (nginx)
// 3. socket address — with ::ffff: IPv6-mapped IPv4 normalized to plain IPv4
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded && String(forwarded).trim()) {
    return String(forwarded).split(",")[0].trim();
  }

  if (req.headers["x-real-ip"] && String(req.headers["x-real-ip"]).trim()) {
    return String(req.headers["x-real-ip"]).trim();
  }

  let ip =
    (req.socket && req.socket.remoteAddress) ||
    (req.connection && req.connection.remoteAddress) ||
    "";

  // normalize: ::1 -> 127.0.0.1 , ::ffff:103.25.14.7 -> 103.25.14.7
  if (ip === "::1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);

  return ip || "unknown";
}

// Device identifier ("MAC-style"): browsers never expose the physical NIC
// MAC of a visitor, so the frontend generates a persistent device id that
// LOOKS like a MAC address and sends it as x-device-id header / deviceId
// cookie. It uniquely identifies the browser/device across visits.
function getDeviceId(req) {
  let id =
    (req.headers["x-device-id"] && String(req.headers["x-device-id"]).trim()) ||
    (req.cookies && req.cookies.deviceId && String(req.cookies.deviceId).trim()) ||
    "";
  // keep only MAC-legal characters, uppercase, max 17 chars (XX:XX:XX:XX:XX:XX)
  id = id.replace(/[^0-9a-fA-F:-]/g, "").toUpperCase().slice(0, 17);
  return id || "unknown";
}

function requestLogger(req, res, next) {
  // public IP when local/private, real client IP behind a proxy
  const clientIP = quickDisplayIp(getClientIp(req));
  const deviceId = getDeviceId(req);

  const timestamp = new Date().toISOString();

  const logEntry = `IP: ${clientIP} | MAC: ${deviceId} | Time: ${timestamp} | ${req.method} | URL: ${req.url}\n`;

  console.log(logEntry.trim());

  // non-blocking append so logging never slows down responses
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error("Error writing to log file:", err.message);
  });

  next();
}

module.exports = { requestLogger, LOG_FILE, getClientIp, getDeviceId };
