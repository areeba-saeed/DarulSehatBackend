const express = require("express");
const { getSpecialities } = require("../controllers/specialitiesController");
const specialitiesRoutes = express.Router();

specialitiesRoutes.get("/", getSpecialities);

module.exports = specialitiesRoutes;
