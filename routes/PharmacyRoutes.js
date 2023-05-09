const express = require("express");
const {
  getAllPharmacy,
  getUserPharmacyPending,
  getUserPharmacyRemaining,
  createOrder,
  cancelOrder,
  changeStatusOrder,
} = require("../controllers/PharmacyOrders");
const pharmacyRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");
const path = require("path");
const multer = require("multer");

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/pharmacy");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create a multer instance
const upload = multer({ storage: storage });

pharmacyRoutes
  .route("/")
  .get(protect, restrictTo("admin", "pharmacy"), getAllPharmacy);
pharmacyRoutes
  .route("/pending/:userId")
  .get(protect, restrictTo("patient"), getUserPharmacyPending);
pharmacyRoutes
  .route("/remaining/:userId")
  .get(protect, restrictTo("patient"), getUserPharmacyRemaining);
pharmacyRoutes
  .route("/new")
  .post(protect, restrictTo("patient"), upload.array("images"), createOrder);
pharmacyRoutes
  .route("/cancel/:id/user/:userId")
  .patch(protect, restrictTo("patient"), cancelOrder);
pharmacyRoutes
  .route("/change/:id")
  .patch(protect, restrictTo("pharmacy", "admin"), changeStatusOrder);

// Route to get images
pharmacyRoutes.get("/images/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, `../assets/pharmacy/${filename}`));
});

module.exports = pharmacyRoutes;
