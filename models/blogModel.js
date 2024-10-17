const path = require("path");
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    img: {
      type: String,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
