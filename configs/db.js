const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

exports.connectDB = asyncHandler(async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
});
