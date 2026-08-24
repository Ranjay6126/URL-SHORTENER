const { getUser } = require("../service/auth");

// For a JSON API we return 401 instead of redirecting to a login page.
// The React app reads the 401 and sends the user to /signup or /login.
function restrictToLoggedInUserOnly(req, res, next) {
  const userUid = req.cookies?.uid;

  if (!userUid) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = getUser(userUid);

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  req.user = user;
  next();
}

module.exports = {
  restrictToLoggedInUserOnly,
};
