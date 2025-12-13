const express = require('express');

const {GenerateNewShortURL, handleGetAnalytics} = require("../controllers/url");
const { handleGetAllUsers } = require('../../MVC/controllers/user');

const router = express.Router();

router.post('/', GenerateNewShortURL);

router.get('/analytics/:shortId', handleGetAnalytics);


module.exports = router;