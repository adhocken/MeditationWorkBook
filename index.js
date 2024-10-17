const express = require("express");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
require("dotenv").config();
const { errorHandler } = require("./middlewares/errorHandler");
const { connectDB } = require("./configs/db");
let path = require("path");

const app = express();
app.use(express.json());

/* connect database */
connectDB();

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/* session */
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "userSessions",
  clear_interval: 86400,
});

app.use(
  session({
    secret: process.env.SECRET,
    cookie: {
      maxAge: 1000 * 60 * 30, // 30 MINUTES
    },
    rolling: true,
    resave: true,
    saveUninitialized: false,
    store: store,
  })
);

app.use("/", require("./routes/homeRoutes"));
app.use("/blogs", require("./routes/blogRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));

/* invalid url handler*/
app.use("*", (req, res) => {
  res.status(404);
  res.redirect("/");
});

/* error handler */
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
