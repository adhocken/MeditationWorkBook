const express = require("express");
const router = express.Router();

const {
  loginUser,
  createUser,
  newUserPage,
  loginPage,
  logoutUser,
} = require("../controllers/userController");

const {
  loginInputValidator,
  registerInputValidator,
} = require("../middlewares/inputValidators");

router.route("/login").get(loginPage).post(loginInputValidator, loginUser);

router
  .route("/new_user")
  .get(newUserPage)
  .post(registerInputValidator, createUser);

router.route("/logout").post(logoutUser);

module.exports = router;
