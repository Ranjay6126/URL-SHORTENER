const express = require("express");

const {
  GenerateNewShortURL,
  handleGetMyUrls,
  handleGetAnalytics,
} = require("../controllers/url");

const router = express.Router();

// create a new short link
router.post("/", GenerateNewShortURL);

// list the logged in user's links (home page data)
router.get("/myurls", handleGetMyUrls);

router.get("/analytics/:shortId", handleGetAnalytics);

module.exports = router;
