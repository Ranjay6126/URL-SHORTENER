const shortid = require("shortid");

const URL = require("../models/url");
const { isAdminEmail } = require("../middlewares/admin");

async function GenerateNewShortURL(req, res) {
  try {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: "url is required" });

    const shortId = shortid.generate();

    await URL.create({
      shortId: shortId,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });

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
    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
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
};
