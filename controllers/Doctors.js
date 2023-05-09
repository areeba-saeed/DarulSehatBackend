const Users = require("../models/Users");
const bcrypt = require("bcryptjs");
const Bookings = require("../models/Bookings");
const moment = require("moment");

const getAllDoctors = async (req, res) => {
  const users = await Users.find({ role: "doctor" });
  res.json(users);
};

const getAllDoctorBookings = async (req, res) => {
  try {
    const bookings = await Bookings.find({
      doctor: req.params.id,
      status: "confirmed",
    });
    const bookingsWithUser = await Promise.all(
      bookings.map(async (user) => {
        if (!user) {
          return null;
        }
        const userDetails = await Users.findById(user.user);

        return {
          ...user.toJSON(),
          userDetails,
        };
      })
    );
    res.json(bookingsWithUser);
  } catch (error) {
    res.json(error);
  }
};

const getCurrentDateDoctorBookings = async (req, res) => {
  try {
    const currentDate = moment().utc().startOf("day");
    const bookings = await Bookings.find({
      doctor: req.params.id,
      date: { $gte: currentDate.toDate() },
      status: "confirmed",
    });
    const bookingsWithUser = await Promise.all(
      bookings.map(async (user) => {
        if (!user) {
          return null;
        }
        const userDetails = await Users.findById(user.user);

        return {
          ...user.toJSON(),
          userDetails,
        };
      })
    );
    res.json(bookingsWithUser);
  } catch (error) {
    res.json(error);
  }
};

const getDoctorById = async (req, res) => {
  await Users.findById(req.params.id)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.json(error);
    });
};

const createDoctor = async (req, res) => {
  const {
    name,
    email,
    phoneNo,
    age,
    gender,
    password,
    specialities,
    registrations,
    languages,
    schedule,
    fees,
  } = req.body;

  const doctor = await Users.findOne({ email: email });
  if (doctor) {
    res.status(404).send("Doctor already exists");
  }

  const photo = req.file ? req.file.filename : "default.jpg";

  if (
    !name ||
    !phoneNo ||
    !email ||
    !password ||
    !age ||
    !gender ||
    !fees ||
    specialities.length <= 0 ||
    schedule.length <= 0
  ) {
    return res.status(400).send("Please fill all the required fields");
  }

  const newDoctor = new Users({
    name: name,
    email: email,
    phoneNo: phoneNo,
    age: age,
    gender: gender,
    password: password,
    specialities: specialities,
    registrations: registrations,
    languages: languages,
    schedule: schedule,
    photo: photo,
    fees: fees,
    role: "doctor",
    isVerified: true,
  });

  // Hash password before saving in database
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newDoctor.password, salt, (err, hash) => {
      if (err) throw err;
      newDoctor.password = hash;
      //   const msg = {
      //     to: newUser.email,
      //     from: `areebamuhammadsaeed@gmail.com`,
      //     subject: "Email Verification OTP",
      //     text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
      //   };

      //   sgMail.send(msg);

      newDoctor
        .save()
        .then((doctor) => res.json(doctor))
        .catch((error) => res.json(error));
    });
  });
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNo,
    age,
    gender,
    password,
    specialities,
    registrations,
    languages,
    schedule,
    fees,
  } = req.body;

  if (!email) {
    res.status(404).send("Email is empty");
  }
  const user = await Users.findOne({ email: email });

  const photo = req.file ? req.file.filename : user.photo;
  const salt = await bcrypt.genSalt(10);
  const hash = password ? await bcrypt.hash(password, salt) : user.password;

  await Users.findByIdAndUpdate(
    id,
    {
      name,
      email,
      phoneNo,
      age,
      gender,
      photo,
      password: hash,
      specialities,
      registrations,
      languages,
      schedule,
      fees,
    },
    { new: true }
  )
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.json(error);
    });
};

const blockDoctor = async (req, res) => {
  const block = req.body.block;
  Users.findByIdAndUpdate(req.params.id, { block: block }, { new: true })
    .then(async () => {
      const users = await Users.find({ role: "doctor" });
      res.json(users);
    })
    .catch((error) => {
      res.json(error);
    });
};

module.exports = {
  createDoctor,
  updateDoctor,
  blockDoctor,
  getAllDoctors,
  getDoctorById,
  getAllDoctorBookings,
  getCurrentDateDoctorBookings,
};
