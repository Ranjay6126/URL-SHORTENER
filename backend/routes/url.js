const express = require("express");

const {
  GenerateNewShortURL,
  handleGetMyUrls,
  handleGetAnalytics,
  handleDeleteUrl,
  handleGetAllUrls,
} = require("../controllers/url");

const router = express.Router();

// create a new short link
router.post("/", GenerateNewShortURL);

// list the logged in user's links (home page data)
router.get("/myurls", handleGetMyUrls);

// ADMIN DASHBOARD: every user's links with creator + IP address
router.get("/all", handleGetAllUrls);

router.get("/analytics/:shortId", handleGetAnalytics);

// delete one of the user's own links (admin may delete any)
router.delete("/:shortId", handleDeleteUrl);

module.exports = router;
