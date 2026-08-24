const bcrypt = require("bcryptjs");

const User = require("../models/user");
const { setUser } = require("../service/auth");
const { isAdminEmail } = require("../middlewares/admin");

// cross-site cookies: when the frontend and backend run on different
// domains (e.g. two Render services), browsers only send cookies marked
// SameSite=None + Secure. Locally (same machine, http) keep defaults.
const COOKIE_OPTIONS =
  process.env.NODE_ENV === "production"
    ? { httpOnly: true, sameSite: "none", secure: true }
    : {};

//signup -> password is hashed with bcrypt before storing in MongoDB
async function handleUserSingup(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email is already registered, please login" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // log the user in right after signup
    const token = setUser(user);
    res.cookie("uid", token, COOKIE_OPTIONS);

    return res.status(201).json({
      ok: true,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

//login -> compares the password with the bcrypt hash stored in MongoDB
async function handleUserlogin(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Email or Password" });
    }

    const token = setUser(user);
    res.cookie("uid", token, COOKIE_OPTIONS);

    return res.json({
      ok: true,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

//logout -> clear the jwt cookie
function handleUserLogout(req, res) {
  res.clearCookie("uid", COOKIE_OPTIONS);
  return res.json({ ok: true });
}

//me -> current logged in user (session restore for the SPA)
function handleGetMe(req, res) {
  return res.json({
    user: {
      _id: req.user._id,
      name: req.user.name || "",
      email: req.user.email,
    },
    isAdmin: isAdminEmail(req.user.email),
  });
}

module.exports = {
  handleUserSingup,
  handleUserlogin,
  handleUserLogout,
  handleGetMe,
};
