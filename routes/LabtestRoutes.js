const express = require("express");
const {
  getAllLabTests,
  setTest,
  updateTest,
  deleteTest,
} = require("../controllers/LabTests");
const { protect, restrictTo } = require("../controllers/User1Controller");
const labTestRoutes = express.Router();

labTestRoutes.route("/").get(getAllLabTests);
labTestRoutes.route("/new").post(protect, restrictTo("lab", "admin"), setTest);
labTestRoutes
  .route("/update/:id")
  .patch(protect, restrictTo("lab", "admin"), updateTest);
labTestRoutes
  .route("/delete/:id")
  .patch(protect, restrictTo("lab", "admin"), deleteTest);

module.exports = labTestRoutes;
