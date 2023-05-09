const express = require("express");
const {
  registerUser,
  verifyUser,
  loginUser,
  logout,
  updateUser,
  getUserById,
  getCurrentDateUserBookings,
  resendEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/User1Controller");
const user1Routes = express.Router();
const path = require("path");
const { protect, restrictTo } = require("../controllers/User1Controller");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/users");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

user1Routes.route("/register").post(registerUser);
user1Routes.route("/verify").post(verifyUser);
user1Routes.route("/resend").patch(resendEmail);
user1Routes.route("/login").post(loginUser);
user1Routes.route("/forgot").patch(forgotPassword);
user1Routes.route("/reset").patch(resetPassword);
user1Routes.route("/logout").post(logout);
user1Routes.route("/find/:id").get(getUserById);
user1Routes.route("/today/:id").get(getCurrentDateUserBookings);
user1Routes
  .route("/update/:id")
  .patch(
    protect,
    restrictTo("patient", "doctor"),
    upload.single("photo"),
    updateUser
  );

// Route to get images
user1Routes.get("/images/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, `../assets/users/${filename}`));
});

module.exports = user1Routes;
