const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  review: {
    type: String,
  },
  rating: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  doctorName: {
    type: String,
  },
  userName: {
    type: String,
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: "Users",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "Users",
  },
});

module.exports = mongoose.model("Reviews", ReviewSchema);
