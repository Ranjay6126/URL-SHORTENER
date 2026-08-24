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

  // not logged in at all -> go to login page
  if (!user) return res.redirect("/login");

  // logged in but not the admin -> access denied
  if (!isAdminEmail(user.email)) {
    return res.status(403).render("403", {
      email: user.email,
      adminEmail: ADMIN_EMAIL,
    });
  }

  req.user = user;
  req.isAdmin = true;
  next();
}

module.exports = { adminOnly, isAdminEmail, ADMIN_EMAIL };
