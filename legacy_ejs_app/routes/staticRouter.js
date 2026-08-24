const express = require("express");
const fs = require("fs");

const router = express.Router();
const URL = require("../models/url");
const { getUser } = require("../service/auth");
const { adminOnly, isAdminEmail } = require("../middlewares/admin");
const { LOG_FILE } = require("../middlewares/logger");

router.get("/", async (req, res) => {
    // home page is private -> only the logged in user's links
    const user = getUser(req.cookies?.uid);
    if (!user) return res.redirect("/signup");

    const allurls = await URL.find({ createdBy: user._id }).sort({
        createdAt: -1,
    });

    return res.render("home", {
        urls: allurls,
        user: user,
        isAdmin: isAdminEmail(user.email),
    });
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

// old typo link kept working
router.get("/singup", (req, res) => res.redirect("/signup"));

router.get("/login", (req, res) => {
    return res.render("login");
});

// logout -> clear the jwt cookie
router.get("/logout", (req, res) => {
    res.clearCookie("uid");
    return res.redirect("/login");
});

// ---------- SERVER LOGS (admin only: panditranjay33@gmail.com) ----------

// view logs in the browser
router.get("/logs", adminOnly, (req, res) => {
    let content = "";
    try {
        content = fs.readFileSync(LOG_FILE, "utf8");
    } catch (err) {
        content = ""; // log file doesn't exist yet
    }
    const lines = content.split("\n").filter(Boolean).reverse(); // newest first
    return res.render("logs", {
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

// wipe the log file (admin only)
router.get("/logs/clear", adminOnly, (req, res) => {
    fs.writeFile(LOG_FILE, "", () => {});
    return res.redirect("/logs");
});

module.exports = router;
