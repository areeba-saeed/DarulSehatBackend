const Users = require("../models/Users");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const elasticemail = require("elasticemail");
const client = elasticemail.createClient({
  username: "Areeba",
  apiKey: process.env.ELASTIC_apiKey,
});

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(
//   "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"
// );

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

const registerUser = async (req, res) => {
  const {
    name,
    phoneNo,
    email,
    age,
    gender,
    password,
    password2,
    street,
    zip,
    city,
    deviceToken,
    state,
  } = req.body;

  const address = { zip: zip, street: street, city: city, state };

  const user = Users.find({ email: email });
  if (!user) {
    res.status.send("This email is already registered! Please login");
  }

  if (
    !name ||
    !phoneNo ||
    !email ||
    !password ||
    !password2 ||
    !age ||
    !gender ||
    !street ||
    !zip ||
    !city ||
    !state
  ) {
    return res.status(400).json("Please fill all the required fields");
  }

  if (password !== password2) {
    return res.status(400).json("Password must match");
  }
  if (password.length < 8) {
    return res.status(400).json("Password must be at least 8 characters long");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires after 10 minutes
  const newUser = new Users({
    name: name,
    email: email,
    age: age,
    gender: gender,
    phoneNo: phoneNo,
    password: password,
    address: address,
    deviceToken: deviceToken,
    otp: otp,
    otpExpiresAt: otpExpiresAt,
    role: "patient",
    isVerified: true,
  });

  // Hash password before saving in database
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      //   const msg = {
      //     to: newUser.email,
      //     from: `areebamuhammadsaeed@gmail.com`,
      //     subject: "Email Verification OTP",
      //     text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
      //   };

      //   sgMail.send(msg);

      setTimeout(() => {
        newUser.otp = null;

        newUser.save();
      }, 10 * 60 * 1000);
      newUser
        .save()
        .then((user) => createSendToken(user, 201, req, res))
        .catch((error) => res.json(error));
    });
  });
};

const verifyUser = async (req, res) => {
  const { email, otp } = req.body;

  const user = await Users.findOne({ email: email });
  try {
    if (!user) {
      res.status(404).send("Invalid email");
    }
    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      res.status(404).send("Invalid otp");
    }

    user.otp = undefined;
    user.isVerified = true;
    user.otpExpiresAt = undefined;
    await user.save();

    createSendToken(user, 201, req, res);
  } catch (error) {
    res.json(error);
  }
};

const resendEmail = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires after 10 minutes
  const email = req.body.email;
  try {
    const user = await Users.findOneAndUpdate(
      { email: email },
      {
        otp: otp,
        otpExpiresAt: otpExpiresAt,
      },
      { new: true }
    );
    // const msg = {
    //   to: email,
    //   from: `areebamuhammadsaeed@gmail.com`,
    //   subject: "Email Verification OTP",
    //   text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
    // };
    // sgMail.send(msg);
    setTimeout(() => {
      user.otp = null;
      user.save();
    }, 60 * 10 * 1000);
    res.json(user.otp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires after 10 minutes
  const email = req.body.email;
  try {
    const user = await Users.findOneAndUpdate(
      { email: email },
      {
        otp: otp,
        otpExpiresAt: otpExpiresAt,
      },
      { new: true }
    );

    var msg = {
      from_name: "Darul sehat",
      from: "areeba5saeed@gmail.com",
      to: email,
      subject: "Email Verification OTP",
      body_text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
    };

    client.mailer.send(msg, function (err, result) {
      if (err) {
        return console.error(err);
      }
      res.send(otp);
      console.log(result);
    });
    // msg = {
    //   to: email,
    //   from: `areebamuhammadsaeed@gmail.com`,
    //   subject: "Email Verification OTP",
    //   text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
    // };
    // try {
    //   await sgMail.send(msg);
    // } catch (error) {
    //   console.error(error);
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, password, password2 } = req.body;
  const user = await Users.findOne({ email: email });
  if (user.otp !== otp) {
    res.status(404).send("Otp invalid");
  }
  if (password !== password2) {
    res.status(404).send("Both password must be same");
  }
  if (password.length < 8) {
    res.status(404).send("Password must be greater than 8 characters");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  await Users.findByIdAndUpdate(
    user._id,
    { password: hashPassword },
    { new: true }
  )
    .then((user) => {
      createSendToken(user, 201, req, res);
    })
    .catch((error) => {
      res.json(error);
    });
};

const loginUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email

  await Users.findOne({ email })
    .then((user) => {
      // Check if user exists
      if (!user) {
        return res.status(404).send("Email not found");
      }
      if (user.block) {
        return res
          .status(404)
          .send("Cannot login with user that is blocked. Contact admin");
      }
      if (!user.isVerified) {
        return res.status(401).send("User not verified");
      }
      // Check password
      bcrypt.compare(password, user.password).then((correct) => {
        if (correct) {
          createSendToken(user, 200, req, res);
        } else {
          return res.status(401).send("Password is invalid");
        }
      });
    })
    .catch((error) => {
      res.json(error);
    });
};

const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res
      .status(401)
      .send("You are not logged in! Please log in to get access.");
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await Users.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .send("The user belonging to this token does no longer exist.");
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return res
        .status(401)
        .send("You do not have permission to perform this action");
    }

    next();
  };
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    age,
    fees,
    gender,
    oldpassword,
    password,
    street,
    zip,
    city,
    state,
  } = req.body;

  try {
    const userById = await Users.findById(id);
    const address = req.body.zip
      ? { zip: zip, street: street, city: city, state }
      : userById.address;

    const photo = req.file ? req.file.filename : userById.photo;
    if (oldpassword) {
      const passwordValid = await bcrypt.compare(
        oldpassword,
        userById.password
      );
      if (!passwordValid) {
        return res.status(404).send("Current password invalid");
      }

      if (oldpassword === password) {
        return res.status(404).send("New password cannot be old password");
      }
      if (password.length < 8) {
        return res.status(404).send("Password Length must be greater than 8");
      }
    }

    // Hash password before saving in database

    const salt = await bcrypt.genSalt(10);
    const hashPassword = password
      ? await bcrypt.hash(password, salt)
      : userById.password;
    await Users.findByIdAndUpdate(
      id,
      {
        name,
        password: hashPassword,
        age,
        gender,
        fees,
        address: address ? address : req.user.address,
        photo,
      },
      { new: true }
    )
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        res.json(error);
      });
  } catch (error) {
    console.error(error);
    res.send("Server error");
  }
};

const getUserById = async (req, res) => {
  await Users.findById(req.params.id)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.json(error);
    });
};

const getCurrentDateUserBookings = async (req, res) => {
  try {
    const currentDate = moment().utc().startOf("day");
    const bookings = await Bookings.find({
      user: req.params.id,
      date: { $gte: currentDate.toDate() },
      status: "confirmed",
    });
    const bookingsWithDoctor = await Promise.all(
      bookings.map(async (doctor) => {
        if (!user) {
          return null;
        }
        const doctorDetails = await Users.findById(doctor.doctor);

        return {
          ...doctor.toJSON(),
          doctorDetails,
        };
      })
    );
    res.json(bookingsWithDoctor);
  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  getUserById,
  logout,
  protect,
  restrictTo,
  updateUser,
  resendEmail,
  getCurrentDateUserBookings,
  forgotPassword,
  resetPassword,
};
