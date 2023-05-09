const express = require("express");
const bookingRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");
const {
  getAllBookings,
  createBooking,
  getBookedData,
  getPastData,
  changeAdminBooking,
  cancelUserBooking,
  getTodayBooking,
} = require("../controllers/Bookings");

bookingRoutes.route("/").get(protect, restrictTo("admin"), getAllBookings);
bookingRoutes
  .route("/today")
  .get(protect, restrictTo("admin"), getTodayBooking);

bookingRoutes.route("/new").post(
  protect,
  restrictTo("patient"),

  createBooking
);
bookingRoutes
  .route("/booked/:userId")
  .get(protect, restrictTo("patient"), getBookedData);
bookingRoutes
  .route("/remaining/:userId")
  .get(protect, restrictTo("patient"), getPastData);
bookingRoutes
  .route("/change/:id")
  .patch(protect, restrictTo("admin"), changeAdminBooking);
bookingRoutes
  .route("/cancel/:id/user/:userId")
  .patch(protect, restrictTo("patient"), cancelUserBooking);

module.exports = bookingRoutes;
