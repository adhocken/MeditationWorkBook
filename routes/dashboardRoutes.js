const path = require("path");
const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const multer = require("multer");
const transporter = require("../utils/mailer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/img/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "File upload only supports the following filetypes - " + filetypes
      )
    );
  },
});

const {
  getDashboardPage,
  getDashboardAuthorPage,
  getDashboardBlogsPage,
  getDashboardEventsPage,
  getDashboardSubscriptionsPage,
  getBlogNewPage,
  getBlogEditPage,
  getEventView,
  getEventEdit,
  createBlog,
  editBlog,
  deleteBlog,
  deleteUser,
  updateEventPrivacy,
  deleteEvent,
  confirmEvent,
  notifyEvent,
  emailEvent,
  editEvent,
  sendEmail,
  deleteSubscription,
  emailSubscribers,
  sendSubscriberEmail,
} = require("../controllers/dashboardController");

const { verifyAuth } = require("../middlewares/verifyAuth");

const {
  blogInputValidator,
  eventInputValidator,
} = require("../middlewares/inputValidators");

router.route("/").get(verifyAuth, getDashboardPage);
router
  .route("/blogs-new")
  .get(verifyAuth, getBlogNewPage)
  .post(verifyAuth, upload.single("file"), createBlog);

router
  .route("/blog-edit")
  .get(verifyAuth, getBlogEditPage)
  .post(verifyAuth, upload.single("file"), editBlog);

router.route("/blog-delete/:id").get(verifyAuth, deleteBlog);

router.route("/user-delete/:id").get(verifyAuth, deleteUser);

router.route("/event-delete/:id").get(verifyAuth, deleteEvent);

router.route("/subscription-delete/:id").get(verifyAuth, deleteSubscription);
router.route("/emailSubscribers").get(verifyAuth, emailSubscribers);

router
  .route("/send-subscriber-email")
  .post(verifyAuth, upload.array("attachments"), sendSubscriberEmail);

router.route("/confirmEvent").get(verifyAuth, confirmEvent);
router.route("/notifyEvent").get(verifyAuth, notifyEvent);
router.route("/emailEvent").get(verifyAuth, emailEvent);

router
  .route("/send-email")
  .post(verifyAuth, upload.array("attachments"), sendEmail);

router.route("/authors").get(verifyAuth, getDashboardAuthorPage);
router.route("/blogs").get(verifyAuth, getDashboardBlogsPage);
router.route("/events").get(verifyAuth, getDashboardEventsPage);
router.route("/subscriptions").get(verifyAuth, getDashboardSubscriptionsPage);

router.route("/event-view").get(verifyAuth, getEventView);
router.route("/event/updatePrivacy").post(verifyAuth, updateEventPrivacy);

router
  .route("/event-edit")
  .get(verifyAuth, getEventEdit)
  .post(verifyAuth, eventInputValidator, editEvent);

module.exports = router;
