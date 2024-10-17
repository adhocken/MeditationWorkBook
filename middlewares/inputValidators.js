const { body, validationResult } = require("express-validator");
const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const { decrypt } = require("../utils/encrypt");

// VALIDATION RESULTS
const results = () => [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// CREATE USER VALIDATION
const registerInputValidator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required")
    .bail()
    .toLowerCase()
    .escape()
    .trim()
    .custom(async (value) => {
      const existUser = await User.findOne({ username: value });
      if (existUser) {
        throw new Error("Username already exists");
      }
      return true;
    }),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password length must be at least 6 characters.")
    .bail()
    .escape()
    .trim(),
  results(),
];

// USER LOGIN VALIDATOR
const loginInputValidator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required")
    .bail()
    .toLowerCase()
    .escape()
    .trim()
    .custom(async (value, { req }) => {
      const registeredUser = await User.findOne({ username: value });
      if (!registeredUser) {
        throw new Error("Username or password incorrect!");
      }
      req.registeredUser = registeredUser;
      return true;
    }),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .bail()
    .escape()
    .trim()
    .custom(async (value, { req }) => {
      if (!req.registeredUser) {
        throw new Error("Username or password incorrect!");
      }
      const isMatchedPassword = await decrypt(
        value,
        req.registeredUser.password
      );
      if (!isMatchedPassword) {
        throw new Error("Username or password incorrect!");
      }
      return true;
    }),
  results(),
];

// BLOG VALIDATOR
const blogInputValidator = [
  [
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title is required")
      .bail()
      .escape()
      .trim(),
    body("body")
      .not()
      .isEmpty()
      .withMessage("Content is required")
      .bail()
      .escape()
      .trim(),
  ],
  results(),
];

// SUBSCRIPTION VALIDATOR
const subscriptionInputValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    .trim()
    .custom(async (value) => {
      const existingSub = await Subscription.findOne({ email: value });
      if (existingSub) {
        throw new Error("Email is already subscribed");
      }
      return true;
    }),
  results(),
];

// EVENT VALIDATOR
const eventInputValidator = [
  [
    body("name").notEmpty().withMessage("Name is required."),
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .bail()
      .isEmail()
      .withMessage("Invalid email format."),
    body("contact")
      .notEmpty()
      .withMessage("Contact number is required.")
      .bail()
      .matches(/^\d{10}$/)
      .withMessage("Invalid contact number. Enter 10 digits."),
    body("orgEvent").notEmpty().withMessage("Event name is required."),
    body("location")
      .notEmpty()
      .withMessage("Location is required.")
      .bail()
      .isLength({ min: 5 })
      .withMessage("Location must be at least 5 characters."),
    body("preferredDate")
      .notEmpty()
      .withMessage("Preferred date is required.")
      .bail()
      .custom((value) => {
        const preferredDate = new Date(value);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

        if (preferredDate < tomorrow) {
          throw new Error("Preferred date must be tomorrow or later.");
        }
        if (preferredDate > sixMonthsFromNow) {
          throw new Error("Preferred date must be within the next 6 months.");
        }
        return true;
      }),
    body("alternateDate")
      .notEmpty()
      .withMessage("Alternate date is required.")
      .bail()
      .custom((value, { req }) => {
        const preferredDate = new Date(req.body.preferredDate);
        const alternateDate = new Date(value);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

        if (alternateDate < tomorrow) {
          throw new Error("Alternate date must be tomorrow or later.");
        }
        if (alternateDate <= preferredDate) {
          throw new Error("Alternate date must be after the preferred date.");
        }
        if (alternateDate > sixMonthsFromNow) {
          throw new Error("Alternate date must be within the next 6 months.");
        }
        return true;
      }),
    body("time")
      .notEmpty()
      .withMessage("Tentative time is required.")
      .bail()
      .custom((value) => {
        const [hours, minutes] = value.split(":");
        const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const startTime = 7 * 60;
        const endTime = 22 * 60;
        if (timeInMinutes < startTime || timeInMinutes > endTime) {
          throw new Error(
            "Tentative time must be between 7:00 AM and 10:00 PM."
          );
        }
        return true;
      }),
    body("attendees")
      .notEmpty()
      .withMessage("Anticipated number of attendees is required.")
      .bail()
      .isNumeric()
      .withMessage("Please enter a valid number.")
      .bail()
      .custom((value) => {
        const attendees = parseInt(value);
        if (attendees < 2) {
          throw new Error("Attendees must be more than 2");
        }
        return true;
      }),
    body("additionalDetails")
      .notEmpty()
      .withMessage("Event details are required.")
      .bail()
      .isLength({ min: 10 })
      .withMessage("Event details must be at least 10 characters"),
  ],
  results(),
];

module.exports = {
  registerInputValidator,
  loginInputValidator,
  blogInputValidator,
  subscriptionInputValidator,
  eventInputValidator,
};
