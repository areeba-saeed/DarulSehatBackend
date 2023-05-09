const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users.schedule",
  },
  day: {
    type: String,
  },
  startTime: {
    type: String,
  },
  status: {
    type: String,
  },
  endTime: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Bookings", BookingSchema);
