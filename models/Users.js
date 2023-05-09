const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    age: {
      type: Number,
    },
    role: {
      type: String,
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
    },
    address: {
      type: Object,
    },
    deviceToken: {
      type: String,
    },
    block: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    specialities: {
      type: [String],
    },
    registrations: {
      type: [String],
    },
    languages: {
      type: [String],
    },
    schedule: {
      type: [
        {
          day: {
            type: String,
          },
          startTime: {
            type: String,
          },
          endTime: {
            type: String,
          },
          maximumAppointments: {
            type: Number,
          },
          currentAppointments: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    fees: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
