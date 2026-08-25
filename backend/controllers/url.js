const shortid = require("shortid");
const fs = require("fs");

const URL = require("../models/url");
const User = require("../models/user");
const Notification = require("../models/notification");
const { isAdminEmail } = require("../middlewares/admin");
const { LOG_FILE, getClientIp, getDeviceId } = require("../middlewares/logger");

async function GenerateNewShortURL(req, res) {
  try {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: "url is required" });

    const shortId = shortid.generate();

    // capture where the request came from (shown to the admin)
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const mac = getDeviceId(req);

    // the JWT payload only carries _id + email, so fetch the fresh
    // profile from MongoDB to attach the user's name as well
    let userName = "";
    try {
      const dbUser = await User.findById(req.user._id).lean();
      userName = dbUser?.name || "";
    } catch {
      /* name is optional */
    }

    await URL.create({
      shortId: shortId,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user._id,
      creatorName: userName,
      creatorEmail: req.user.email,
      creatorIp: ip,
      creatorMac: mac,
      creatorUserAgent: userAgent,
    });

    // ---- notify the admin about every link created by a NORMAL user ----
    // (the admin account itself is skipped — no self-notifications)
    if (!isAdminEmail(req.user.email)) {
      try {
        await Notification.create({
          userName,
          userEmail: req.user.email,
          userId: req.user._id,
          shortId,
          redirectURL: body.url,
          ip,
          mac,
          userAgent,
        });

        // also drop a detailed line into server_logs.txt so it shows up
        // in the raw log view / download for the admin
        fs.appendFile(
          LOG_FILE,
          `NOTIFY -> ${process.env.ADMIN_EMAIL || "panditranjay33@gmail.com"} | ` +
            `User: ${userName || "-"} (${req.user.email}) created /${shortId} ` +
            `-> ${body.url} | IP: ${ip} | Time: ${new Date().toISOString()}\n`,
          () => {}
        );
      } catch (notifyErr) {
        // notification problems must never break link creation
        console.error("Admin notification failed:", notifyErr.message);
      }
    }

    // re-fetch only this user's links so the table stays up to date
    const urls = await URL.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(201).json({ id: shortId, urls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

// ADMIN DASHBOARD — every link created by every user, with the creator's
// name, email and the IP address the link was shortened from.
async function handleGetAllUrls(req, res) {
  try {
    if (!isAdminEmail(req.user.email)) {
      return res.status(403).json({ error: "Access denied — admin only" });
    }

    const urls = await URL.find({}).sort({ createdAt: -1 }).lean();

    // older links were stored before the creatorIp field existed —
    // backfill their IP from the admin-notification collection
    const missing = urls.filter((u) => !u.creatorIp).map((u) => u.shortId);
    const ipMap = {};
    if (missing.length > 0) {
      const notifs = await Notification.find({
        shortId: { $in: missing },
      }).lean();
      for (const n of notifs) {
        if (!ipMap[n.shortId] && n.ip) ipMap[n.shortId] = n.ip;
      }
    }

    const enriched = urls.map((u) => ({
      _id: u._id,
      shortId: u.shortId,
      redirectURL: u.redirectURL,
      clicks: (u.visitHistory || []).length,
      createdAt: u.createdAt,
      creatorName: u.creatorName || "",
      creatorEmail: u.creatorEmail || "",
      creatorIp: u.creatorIp || ipMap[u.shortId] || "",
      creatorMac: u.creatorMac || "",
    }));

    return res.json({ urls: enriched, total: enriched.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

// delete one of the logged-in user's own links (admin may delete any)
async function handleDeleteUrl(req, res) {
  try {
    const shortId = req.params.shortId;

    const entry = await URL.findOne({ shortId });
    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    const isOwner =
      entry.createdBy && String(entry.createdBy) === String(req.user._id);
    if (!isOwner && !isAdminEmail(req.user.email)) {
      return res
        .status(403)
        .json({ error: "You can delete only your own links" });
    }

    await URL.deleteOne({ _id: entry._id });

    return res.json({ ok: true, deleted: shortId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

// all links of the logged in user + who they are (for the home page)
async function handleGetMyUrls(req, res) {
  try {
    const urls = await URL.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json({
      urls,
      user: {
        _id: req.user._id,
        name: req.user.name || "",
        email: req.user.email,
      },
      isAdmin: isAdminEmail(req.user.email),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

async function handleGetAnalytics(req, res) {
  try {
    const shortId = req.params.shortId;

    const result = await URL.findOne({ shortId });
    if (!result) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // normal users must NOT receive visitor IP / device (MAC) identifiers —
    // strip them from the payload entirely; only the admin gets full data
    const isAdmin = isAdminEmail(req.user.email);
    const analytics = (result.visitHistory || []).map((v) => {
      const plain = typeof v.toObject === "function" ? v.toObject() : v;
      if (isAdmin) return plain;
      const { ip, mac, ...rest } = plain;
      return rest;
    });

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = {
  GenerateNewShortURL,
  handleGetMyUrls,
  handleGetAnalytics,
  handleDeleteUrl,
  handleGetAllUrls,
};
