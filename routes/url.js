const express = require('express');
const URL = require('../models/url');

const {GenerateNewShortURL, handleGetAnalytics} = require("../controllers/url");

const router = express.Router();

router.post('/', GenerateNewShortURL);

router.get('/analytics/:shortId', handleGetAnalytics);


module.exports = router;
