const mongoose = require("mongoose");

const LabTestsSchema = mongoose.Schema({
  testName: {
    type: String,
    required: true,
  },
  testCode: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("LabTests", LabTestsSchema);
