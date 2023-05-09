const express = require("express");
const {
  createDoctor,
  updateDoctor,
  blockDoctor,
  getAllDoctors,
  getDoctorById,
  getAllDoctorBookings,
  getCurrentDateDoctorBookings,
} = require("../controllers/Doctors");

const doctorRoutes = express.Router();
const { protect, restrictTo } = require("../controllers/User1Controller");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/doctors");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

doctorRoutes
  .route("/")
  .get(protect, restrictTo("admin", "patient"), getAllDoctors);
doctorRoutes.route("/find/:id").get(getDoctorById);
doctorRoutes
  .route("/allBookings/:id")
  .get(
    protect, restrictTo("admin", "doctor"),
     getAllDoctorBookings);
doctorRoutes.route("/today/:id").get(getCurrentDateDoctorBookings);

doctorRoutes
  .route("/new")
  .post(protect, restrictTo("admin"), upload.single("photo"), createDoctor);

doctorRoutes
  .route("/update/:id")
  .patch(
    protect,
    restrictTo("admin", "doctor"),
    upload.single("photo"),
    updateDoctor
  );

doctorRoutes
  .route("/block/:id")
  .patch(protect, restrictTo("admin"), blockDoctor);

// Route to get images
doctorRoutes.get("/images/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, `../assets/doctors/${filename}`));
});

module.exports = doctorRoutes;
