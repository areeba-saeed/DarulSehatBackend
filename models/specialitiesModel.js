const mongoose = require("mongoose");

const Specialities = mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Specialities", Specialities);
