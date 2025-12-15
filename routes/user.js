const express = require('express');
const userController = require('../controllers/user');


const {handleUserSingup,handleUserlogin} = require("../controllers/user")


const router = express.Router();

router.post("/", handleUserSingup);
router.post("/login", handleUserlogin)


module.exports = router;