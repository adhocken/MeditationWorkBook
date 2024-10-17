const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { encrypt } = require("../utils/encrypt");

/* 
@route   GET /user/new_user
*/
const newUserPage = asyncHandler(async (req, res) => {
  if (!req.session?.token) {
    return res.redirect("/user/login");
  }

  res.render("newUserPage", { token: req.session?.token || null });
});

/* 
@route   GET /user/login
*/
const loginPage = asyncHandler(async (req, res) => {
  if (req.session?.token) {
    return res.redirect("/dashboard");
  }

  res.render("loginPage", { token: req.session?.token || null });
});

/* 
login user 
*/
const loginUser = asyncHandler(async (req, res) => {
  const registeredUser = req.registeredUser;

  req.session.token = {
    uid: registeredUser._id,
    username: registeredUser.username,
  };

  registeredUser.session_id = req.session.id;
  await registeredUser.save();

  return res
    .status(200)
    .json({ success: true, message: "Logged in successfully" });
});

/* 
Create a new user 
*/
const createUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await encrypt(req.body.password);

  const newUser = await User.create({
    username,
    password: hashedPassword,
    roles: ["admin"],
  });

  return res
    .status(200)
    .json({ success: true, message: "Account created successfully" });
});

/* 
Logout user
*/
const logoutUser = asyncHandler(async (req, res) => {
  if (req.session.token) {
    await User.findOneAndUpdate(
      { _id: req.session.token.uid },
      { session_id: "" }
    );
  }

  req.session.destroy();

  res.redirect("/user/login");
});

module.exports = { loginUser, createUser, logoutUser, newUserPage, loginPage };
