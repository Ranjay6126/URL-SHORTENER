const shortid = require("shortid");

const URL = require("../models/url");
const { isAdminEmail } = require("../middlewares/admin");

async function GenerateNewShortURL(req, res) {
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

  return res.render('home', {
    id : shortId,
    urls,
    user: req.user,
    isAdmin: isAdminEmail(req.user.email),
  })
}

async function handleGetAnalytics(req,res) {
  const shortId = req.params.shortId;

  const result = await URL.findOne({ shortId });
  if (!result) {
    return res.status(404).json({ error: "Short URL not found" });
  }
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  GenerateNewShortURL,
  handleGetAnalytics,
};
