const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");

// fetch all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const { page } = req.query;

  const limit = 6;
  const skipIndex = (page - 1) * limit;

  const blogs = await Blog.find().limit(limit).skip(skipIndex).exec();

  const blogsTotal = await Blog.find();
  const totalPages = Math.ceil(blogsTotal.length / limit);

  const nextPage = parseInt(page) + 1;

  let updatedBlogs = [];

  await blogs.forEach(async (obj) => {
    let short = (text) =>
      text.length > 150 ? text.match(/.{150,}?(?=\b)/)[0] : text;

    updatedBlogs.push({ ...obj.toObject(), shortBody: short(obj.body) });
  });

  res.render("blogs", {
    blogs: updatedBlogs,
    page,
    totalPages,
    nextPage,
    token: req.session.token || null,
  });
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  res.render("blogItem", {
    blog,
    token: req.session.token || null,
  });
});

module.exports = {
  getAllBlogs,
  getBlogById,
};
