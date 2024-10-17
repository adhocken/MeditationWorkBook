const express = require("express");
const router = express.Router();

const { getAllBlogs, getBlogById } = require("../controllers/blogController");

router.route("/").get(getAllBlogs);

router.route("/:id").get(getBlogById);

module.exports = router;
