const express = require("express");
const {
  getUsers,
  deleteUser,
  blockUser,
  updateUser,
  allBlockedUsers,
  getNotification,
} = require("../controllers/UserController");
const userRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");

userRoutes.route("/").get(protect, restrictTo("admin"), getUsers);
userRoutes
  .route("/allBlocked")
  .get(protect, restrictTo("admin"), allBlockedUsers);
userRoutes
  .route("/delete/:id")
  .delete(protect, restrictTo("admin"), deleteUser);
userRoutes.route("/block/:id").patch(protect, restrictTo("admin"), blockUser);
userRoutes.route("/update/:id").patch(protect, restrictTo("admin"), updateUser);
userRoutes
  .route("/notifications")
  .post(protect, restrictTo("admin"), getNotification);
module.exports = userRoutes;
