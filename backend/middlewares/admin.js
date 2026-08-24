// ================= ADMIN GATE =================
// Only the configured admin email may view /logs or /download.
const { getUser } = require("../service/auth");

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "panditranjay33@gmail.com";

function isAdminEmail(email) {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function adminOnly(req, res, next) {
  const user = getUser(req.cookies?.uid);

  // not logged in at all -> 401
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // logged in but not the admin -> 403
  if (!isAdminEmail(user.email)) {
    return res.status(403).json({
      error: "Access denied — admin only",
      email: user.email,
      adminEmail: ADMIN_EMAIL,
    });
  }

  req.user = user;
  req.isAdmin = true;
  next();
}

module.exports = { adminOnly, isAdminEmail, ADMIN_EMAIL };
