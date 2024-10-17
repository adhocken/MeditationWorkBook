const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Subscription = require("../models/subscriptionModel");
const Event = require("../models/eventModel");

const getIndexPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("index", { token: req.session?.token || null });
});

const getToolsPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("tools", { token: req.session?.token || null });
});

const getEventsPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("events", { token: req.session?.token || null });
});

const getInfoPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("book-info", { token: req.session?.token || null });
});

const getCalendarPage = asyncHandler(async (req, res) => {
  const { page = 1, filter = "incoming" } = req.query;

  const limit = 5;
  const skipIndex = (page - 1) * limit;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filterCondition = {
    confirmation: "Accepted",
    privacy: "Public",
  };

  if (filter === "incoming") {
    filterCondition.preferredDate = { $gte: today };
  } else {
    filterCondition.preferredDate = { $lt: today };
  }

  const calendarEvents = await Event.find(filterCondition);
  const totalPages = Math.ceil(calendarEvents.length / limit);
  const nextPage = parseInt(page) + 1;

  const pageCalendar = await Event.find(filterCondition)
    .sort({ preferredDate: filter === "incoming" ? 1 : -1 })
    .limit(limit)
    .skip(skipIndex)
    .exec();

  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  pageCalendar.forEach((event) => {
    event.time = new Date(`1970-01-01T${event.time}`).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }
    );
  });

  res.render("calendar", {
    calendarEvents: pageCalendar,
    page,
    totalPages,
    nextPage,
    token: req.session?.token || null,
    filter,
  });
});

const getTOSPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("TOS", { token: req.session?.token || null });
});

const getPolicyPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("privacyPolicy", { token: req.session?.token || null });
});

const getAuthorGitaPage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("author-gita", { token: req.session?.token || null });
});

const getAuthorJuliePage = asyncHandler(async (req, res) => {
  const loggedInUser = await User.find({
    session_id: req.session?.id,
  });

  if (loggedInUser.length === 0 && req.session?.token) {
    req.session?.destroy();
  }

  res.render("author-julie", { token: req.session?.token || null });
});

const getSubscription = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await Subscription.create({ email });

  return res.status(200).json({ message: "Successfully subscribed!" });
});

const requestEvent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    contact,
    orgEvent,
    location,
    preferredDate,
    alternateDate,
    time,
    attendees,
    additionalDetails,
  } = req.body;

  const event = await Event.create({
    name,
    email,
    contact,
    orgEvent,
    location,
    preferredDate: preferredDate,
    alternateDate: alternateDate,
    time,
    attendees,
    additionalDetails,
  });

  res.status(200).json({ message: "Event request submitted successfully." });
});

module.exports = {
  getIndexPage,
  getToolsPage,
  getAuthorGitaPage,
  getAuthorJuliePage,
  getInfoPage,
  getCalendarPage,
  getEventsPage,
  getTOSPage,
  getPolicyPage,
  getSubscription,
  requestEvent,
};
