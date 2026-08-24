const express = require("express");

const {
  handleUserSingup,
  handleUserlogin,
  handleUserLogout,
  handleGetMe,
} = require("../controllers/user");
const { restrictToLoggedInUserOnly } = require("../middlewares/auth");

const router = express.Router();

router.post("/", handleUserSingup);
router.post("/login", handleUserlogin);
router.get("/logout", restrictToLoggedInUserOnly, handleUserLogout);
router.get("/me", restrictToLoggedInUserOnly, handleGetMe);

module.exports = router;
