const Specialities = require("../models/specialitiesModel");

const getSpecialities = async (req, res) => {
  const specialities = await Specialities.find();
  res.json(specialities);
};

module.exports = { getSpecialities };
