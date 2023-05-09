const express = require("express");
const cors = require("cors");
const passport = require("passport");
const PORT = process.env.PORT || 5000;
const { connectDB } = require("./config/db");
const path = require("path");
const userRoutes = require("./routes/UserRoutes");
const user1Routes = require("./routes/User1Routes");
const labTestRoutes = require("./routes/LabtestRoutes");
const doctorRoutes = require("./routes/Doctor");
const reviewRoutes = require("./routes/ReviewRoutes");
const pharmacyRoutes = require("./routes/PharmacyRoutes");
const labOrderRoutes = require("./routes/LabOrderRoutes");
const homeVisitRoutes = require("./routes/HomeVisitRoutes");
const bookingRoutes = require("./routes/BookingRoutes");
const specialitiesRoutes = require("./routes/specialitiesRoutes");
const memberRoutes = require("./routes/MemberRoutes");

const app = express();
connectDB();
const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "assets")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport middlewares
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);

app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/user1", user1Routes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/labtest", labTestRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/specialities", specialitiesRoutes);
app.use("/api/v1/pharmacy-orders", pharmacyRoutes);
app.use("/api/v1/homeVisit", homeVisitRoutes);
app.use("/api/v1/lab-orders", labOrderRoutes);
app.get("/", (req, res) => {
  res.send("Connected");
});
// Define error-handling middleware function
app.use(function (req, res, next) {
  res.status(404).send("Sorry, this route does not exist.");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
