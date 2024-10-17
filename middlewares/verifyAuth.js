const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const verifyAuth = asyncHandler(async (req, res, next) => {
  if (!req.session.token) {
    res.redirect("/");
  }

  const validUser = await User.findOne({
    $and: [{ _id: req.session.token?.uid, session_id: req.session.id }],
  });

  if (!validUser) {
    res.redirect("/");
  }

  next();
});

module.exports = { verifyAuth };
