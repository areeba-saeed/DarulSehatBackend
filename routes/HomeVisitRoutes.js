const express = require("express");
const homeVisitRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");
const {
  getHomeVisit,
  setCharges,
  updateCharge,
} = require("../controllers/HomeVisit");

homeVisitRoutes
  .route("/")
  .get(protect, restrictTo("admin", "lab"), getHomeVisit);
homeVisitRoutes
  .route("/new")
  .post(protect, restrictTo("admin", "lab"), setCharges);
homeVisitRoutes
  .route("/:id")
  .patch(protect, restrictTo("admin", "lab"), updateCharge);

module.exports = homeVisitRoutes;
