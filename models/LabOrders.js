const mongoose = require("mongoose");

const LabOrders = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  tests: [
    {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabTests",
      },
      quantity: {
        type: Number,
      },
    },
  ],
  totalPrice: {
    type: Number,
  },
  other: {
    type: Boolean,
    default: false,
  },

  result: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["new-order", "in-process", "cancelled", "completed"],
    default: "new-order",
  },
  homeVisitCharges: {
    type: Number,
  },
  patientDetails: {
    type: Object,
  },
  images: {
    type: [String],
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LabOrders", LabOrders);
