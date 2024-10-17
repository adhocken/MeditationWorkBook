const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    contact: String,
    orgEvent: String,
    location: String,
    preferredDate: Date,
    alternateDate: Date,
    time: String,
    attendees: Number,
    additionalDetails: String,
    confirmation: {
      type: String,
      default: "Pending",
    },
    privacy: {
      type: String,
      enum: ["Public", "Private"],
      default: "Private",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
