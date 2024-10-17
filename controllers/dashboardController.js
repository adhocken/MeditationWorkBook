const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const Subscription = require("../models/subscriptionModel");
const transporter = require("../utils/mailer");

const getDashboardPage = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const blogs = await Blog.find().sort({ createdAt: -1 });
  const events = await Event.find().sort({ preferredDate: -1 });
  const subscriptions = await Subscription.find().sort({ createdAt: -1 });

  let updatedBlogs = [];

  await blogs.forEach(async (obj) => {
    let user = await users?.find((u) => {
      return u._id.toString() === obj.author.toString();
    });

    if (user) {
      updatedBlogs.push({ ...obj.toObject(), email: user.email });
    } else {
      updatedBlogs.push(obj);
    }
  });

  res.render("dashboard", {
    pageTitle: "Home",
    users,
    blogs: updatedBlogs,
    events,
    subscriptions,
  });
});

const getDashboardAuthorPage = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.render("dashboard-authors", { pageTitle: "Authors", users });
});

const getDashboardBlogsPage = asyncHandler(async (req, res) => {
  const users = await User.find();
  const blogs = await Blog.find();

  const { page } = req.query;

  const limit = 6;
  const skipIndex = (page - 1) * limit;

  const pageBlogs = await Blog.find().limit(limit).skip(skipIndex).exec();

  const totalPages = Math.ceil(blogs.length / limit);

  const nextPage = parseInt(page) + 1;

  let updatedBlogs = [];

  await pageBlogs.forEach(async (obj) => {
    let user = await users?.find((u) => {
      return u._id.toString() === obj.author.toString();
    });

    if (user) {
      updatedBlogs.push({ ...obj.toObject(), email: user.email });
    } else {
      updatedBlogs.push(obj);
    }
  });

  res.render("dashboard-blogs", {
    pageTitle: "Blogs",
    page,
    blogs: updatedBlogs,
    totalPages,
    nextPage,
  });
});

const getBlogNewPage = asyncHandler((req, res) => {
  res.render("dashboard-blog-new", { pageTitle: "Add Blog" });
});

const getBlogEditPage = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const blog = await Blog.find({ _id: id });

  if (!blog) {
    res.redirect("dashboard/blogs?page=1");
  }

  res.render("dashboard-blog-edit", { pageTitle: "Edit Blog", blog });
});

const createBlog = asyncHandler(async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.create({
    title,
    body,
    img: req.file ? req.file.filename : "default-image.jpg",
    author: req.session.token.uid,
  });

  blog.save();

  res.redirect("/dashboard/blogs?page=1");
});

const editBlog = asyncHandler(async (req, res) => {
  const { title, body } = req.body;

  const { id } = req.query;

  const blog = await Blog.findOneAndUpdate(
    { _id: id },
    { title, body },
    { new: true }
  );

  if (req.file) {
    blog.img = `${req.file.filename}`;
  }

  blog.save();

  res.redirect("/dashboard/blogs?page=1");
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id) {
    await Blog.deleteOne({ _id: id }).exec();
  }

  res.redirect("/dashboard/blogs?page=1");
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id) {
    await User.deleteOne({ _id: id }).exec();
  }

  res.redirect("/dashboard/authors");
});

const updateEventPrivacy = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { privacy } = req.body;

  const event = await Event.findOne({ _id: id });

  if (event) {
    event.privacy = privacy;
    await event.save();

    res.status(200).send({ message: "Privacy updated successfully." });
  } else {
    res.status(400).send({ message: "Event not found." });
  }
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id) {
    await Event.deleteOne({ _id: id }).exec();
  }

  res.redirect("/dashboard/events?page=1");
});

const confirmEvent = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const event = await Event.findOne({ _id: id });

  if (event) {
    event.confirmation = "Accepted";
    event.save();
  }

  res.redirect("/dashboard/events?page=1");
});

const notifyEvent = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const event = await Event.findOne({ _id: id });

  if (event) {
    event.confirmation = "Accepted";
    event.save();
  }

  res.redirect(`/dashboard/emailEvent?id=${id}`);
});

const emailEvent = asyncHandler(async (req, res) => {
  const eventId = req.query.id;

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404).send("Event not found");
    return;
  }

  const formattedTime = new Date(`1970-01-01T${event.time}`).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }
  );

  const emailBody = `
    <p>Dear ${event.name},</p>
    <p>Your event '<strong>${event.orgEvent}</strong>' has been confirmed.</p>
    <p>Event Details:</p>
    <ul>
      <li><strong>Location:</strong> ${event.location}</li>
      <li><strong>Date:</strong> ${new Date(
        event.preferredDate
      ).toLocaleDateString()}</li>
      <li><strong>Time:</strong> ${formattedTime}</li>
      <li><strong>Attendees:</strong> ${event.attendees}</li>
    </ul>
    <p>Thank you for choosing our services!</p>
  `;

  res.render("dashboard-event-email", {
    pageTitle: "Email Organizer",
    event,
    emailBody,
  });
});

const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, body } = req.body;

  const attachments = req.files.map((file) => ({
    filename: file.originalname,
    path: file.path,
  }));

  const mailOptions = {
    from: "Meditation Workbook<meditationworkbook.website@gmail.com>",
    to: to,
    subject: subject,
    html: body,
    attachments: attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect("/dashboard/events?page=1");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

const getDashboardEventsPage = asyncHandler(async (req, res) => {
  const { page = 1, filter = "incoming" } = req.query;

  const limit = 6;
  const skipIndex = (page - 1) * limit;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filterCondition;
  if (filter === "incoming") {
    filterCondition = { preferredDate: { $gte: today } };
  } else {
    filterCondition = { preferredDate: { $lt: today } };
  }

  const events = await Event.find(filterCondition);

  const pageEvents = await Event.find(filterCondition)
    .sort({ preferredDate: filter === "incoming" ? 1 : -1 })
    .limit(limit)
    .skip(skipIndex)
    .exec();

  const totalPages = Math.ceil(events.length / limit);

  const nextPage = parseInt(page) + 1;

  res.render("dashboard-events", {
    pageTitle: "Events",
    events: pageEvents,
    page,
    totalPages,
    nextPage,
    filter,
  });
});

const getDashboardSubscriptionsPage = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find();

  const { page } = req.query;

  const limit = 7;
  const skipIndex = (page - 1) * limit;

  const pageSubscriptions = await Subscription.find()
    .limit(limit)
    .skip(skipIndex)
    .exec();

  const totalPages = Math.ceil(subscriptions.length / limit);

  const nextPage = parseInt(page) + 1;

  res.render("dashboard-subscriptions", {
    pageTitle: "Subscribers",
    page,
    subscriptions: pageSubscriptions,
    totalPages,
    nextPage,
  });
});

const getEventView = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const event = await Event.find({ _id: id });
  res.render("dashboard-event-view", { pageTitle: "View Event", event });
});

const getEventEdit = asyncHandler(async (req, res) => {
  const eventId = req.query.id;
  const event = await Event.find({ _id: eventId });

  res.render("dashboard-event-edit", {
    pageTitle: "Edit Event",
    event,
  });
});

const editEvent = asyncHandler(async (req, res) => {
  const { id } = req.query;

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

  const event = await Event.findOneAndUpdate(
    { _id: id },
    {
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
    },
    { new: true }
  );

  res.status(200).json({
    message: "Event edited successfully.",
    redirect: true,
    redirectUrl: `/dashboard/event-view?id=${event._id}`,
  });
});

const deleteSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id) {
    await Subscription.deleteOne({ _id: id }).exec();
  }

  res.redirect("/dashboard/subscriptions?page=1");
});

const emailSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscription.find();
  const emails = subscribers.map((sub) => sub.email).join(", ");

  res.render("dashboard-subscriptions-email", {
    pageTitle: "Email Subscribers",
    emailBody: "",
    emails: emails,
  });
});

const sendSubscriberEmail = asyncHandler(async (req, res) => {
  const { to, subject, body } = req.body;
  const toEmails = to.split(",").map((email) => email.trim());

  const attachments = req.files.map((file) => ({
    filename: file.originalname,
    path: file.path,
  }));

  try {
    for (const email of toEmails) {
      const mailOptions = {
        from: "Meditation Workbook<meditationworkbook.website@gmail.com>",
        to: email,
        subject: subject,
        html: body,
        attachments: attachments,
      };

      await transporter.sendMail(mailOptions);
    }

    res.redirect("/dashboard/subscriptions?page=1");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

module.exports = {
  getDashboardPage,
  getDashboardAuthorPage,
  getDashboardBlogsPage,
  getDashboardEventsPage,
  getDashboardSubscriptionsPage,
  getBlogNewPage,
  createBlog,
  getBlogEditPage,
  getEventView,
  getEventEdit,
  editBlog,
  deleteBlog,
  deleteUser,
  updateEventPrivacy,
  deleteEvent,
  confirmEvent,
  notifyEvent,
  editEvent,
  emailEvent,
  sendEmail,
  deleteSubscription,
  emailSubscribers,
  sendSubscriberEmail,
};
