const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

const encrypt = asyncHandler(async (password) => {
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
});

const decrypt = asyncHandler(async (reqPassword, dbPassword) => {
  const isMatched = await bcrypt.compare(reqPassword, dbPassword);

  return isMatched;
});

module.exports = { encrypt, decrypt };
