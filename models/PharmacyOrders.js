const mongoose = require("mongoose");

const PharmacyOrders = mongoose.Schema({
  images: {
    type: [String],
  },
  medicineNames: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    default: "COD",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  address: {
    type: Object,
  },
});

module.exports = mongoose.model("PharmacyOrders", PharmacyOrders);
