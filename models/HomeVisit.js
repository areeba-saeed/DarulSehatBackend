const mongoose = require("mongoose");

const HomeVisitCharges = mongoose.Schema({
  charges: {
    type: Number,
  },
});

module.exports = mongoose.model("HomeVisitCharges", HomeVisitCharges);
