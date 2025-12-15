const shortid = require("shortid");

const URL = require("../models/url");

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

  //this is for the json response
  // return res.json({ id: shortId });

  return res.render('home', {
    id : shortId,
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
