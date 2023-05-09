const express = require("express");
const labOrderRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");
const {
  getAllOrders,
  getUserLabPending,
  getUserLabRemaining,
  createLabOrder,
  cancelOrder,
  changeStatus,
  uploadResult,
  uploadOrder,
} = require("../controllers/LabOrders");
const path = require("path");
const multer = require("multer");

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/lab");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create a multer instance
const upload = multer({ storage: storage });

labOrderRoutes
  .route("/")
  .get(protect, restrictTo("admin", "lab"), getAllOrders);
labOrderRoutes
  .route("/ordered/:userId")
  .get(protect, restrictTo("patient"), getUserLabPending);
labOrderRoutes
  .route("/remaining/:userId")
  .get(protect, restrictTo("patient"), getUserLabRemaining);
labOrderRoutes.route("/new").post(
  protect,
  restrictTo("patient"),
  upload.array("images"),

  createLabOrder
);

labOrderRoutes
  .route("/cancel/:id/user/:userId")
  .patch(protect, restrictTo("patient"), cancelOrder);
labOrderRoutes
  .route("/change/:id")
  .patch(protect, restrictTo("lab", "admin"), changeStatus);
labOrderRoutes
  .route("/updatePrice/:id")
  .patch(protect, restrictTo("lab", "admin"), uploadOrder);

labOrderRoutes
  .route("/completed/:id")
  .patch(
    protect,
    restrictTo("lab", "admin"),
    upload.array("result"),
    uploadResult
  );

// Route to get images
labOrderRoutes.get("/docs/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, `../assets/lab/${filename}`));
});

module.exports = labOrderRoutes;
