const allowedOrigins = require("./allowedOrigins");

var corsOptions = function (req, callback) {
  var corsOpts;
  if (allowedOrigins.indexOf(req.header("Origin")) !== -1) {
    corsOpts = { origin: true, optionsSuccessStatus: 200 };
  } else {
    throw new Error("Not allowed by CORS");
  }
  callback(null, corsOpts);
};

module.exports = corsOptions;
