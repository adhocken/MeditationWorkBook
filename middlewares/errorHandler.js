const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode === 200 || 201 ? 400 : res.statusCode || 500;

  let path = "";

  res.status(statusCode);

  console.log(req.url);

  if (req.url === "/user/new_user") {
    path = "newUserPage";
  } else if (req.url === "/user/login") {
    path = "loginPage";
  } else {
    path = req.url;
  }

  res.render(path, {
    errors: err,
    token: req.session?.token,
  });
};

module.exports = { errorHandler };
