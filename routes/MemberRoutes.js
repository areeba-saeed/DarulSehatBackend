const express = require("express");
const memberRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");
const { updateMember, updateAdmin } = require("../controllers/Members");

memberRoutes
  .route("/members/:id")
  .patch(protect, restrictTo("lab", "admin", "pharmacy"), updateMember);
memberRoutes
  .route("/admin/:id")
  .patch(protect, restrictTo("admin"), updateAdmin);

module.exports = memberRoutes;
