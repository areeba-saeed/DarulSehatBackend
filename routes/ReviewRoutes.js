const express = require("express");
const {
  getAllReviews,
  setReview,
  updateReview,
  deleteReview,
} = require("../controllers/Reviews");
const reviewRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");

reviewRoutes.route("/").get(protect, restrictTo("admin"), getAllReviews);
reviewRoutes
  .route("/new/:doctorId")
  .post(protect, restrictTo("patient"), setReview);
reviewRoutes
  .route("/:id")
  .patch(protect, restrictTo("admin", "patient"), updateReview)
  .delete(protect, restrictTo("admin", "patient"), deleteReview);

module.exports = reviewRoutes;
