const Bookings = require("../models/Bookings");
const Users = require("../models/Users");
const moment = require("moment");
const { sendNotification } = require("./Notification");

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Bookings.find();

    const bookingsWithDoctor = await Promise.all(
      bookings.map(async (booking) => {
        if (!booking) {
          // check if booking is null or undefined
          return null;
        }
        const doctorDetails = await Users.findById(booking.doctor);

        return {
          ...booking.toJSON(),
          doctorDetails,
        };
      })
    );

    const bookingsWithUser = await Promise.all(
      bookingsWithDoctor.map(async (user) => {
        if (!user) {
          return null;
        }
        const userDetails = await Users.findById(user.user);

        return {
          ...user,
          userDetails,
        };
      })
    );

    res.json(bookingsWithUser);
  } catch (error) {
    res.json(error);
  }
};

const getBookedData = async (req, res) => {
  const userId = req.params.userId;
  const currentDate = new Date();
  const bookings = await Bookings.find({
    status: "booked",
    user: userId,
    date: { $gte: currentDate },
  });
  const bookingsWithDoctor = await Promise.all(
    bookings.map(async (booking) => {
      if (!booking) {
        // check if booking is null or undefined
        return null;
      }
      const doctorDetails = await Users.findById(booking.doctor);

      return {
        ...booking.toJSON(),
        doctorDetails,
      };
    })
  );
  res.json(bookingsWithDoctor);
};
const getPastData = async (req, res) => {
  const userId = req.params.userId;
  const bookings = await Bookings.find({
    status: { $nin: ["booked"] },
    user: userId,
  });
  const bookingsWithDoctor = await Promise.all(
    bookings.map(async (booking) => {
      if (!booking) {
        // check if booking is null or undefined
        return null;
      }
      const doctorDetails = await Users.findById(booking.doctor);

      return {
        ...booking.toJSON(),
        doctorDetails,
      };
    })
  );
  res.json(bookingsWithDoctor);
};

const createBooking = async (req, res) => {
  const { date, doctor, schedule } = req.body;
  const user = req.user.id;

  const findDoctor = await Users.findOne({ _id: doctor });
  const findSchedule = findDoctor.schedule.find((item) => item._id == schedule);
  const moment = require("moment");

  const dateMoment = moment(date, "DD/MM/YYYY");
  if (!dateMoment.isValid()) {
    res.status(400).send("Invalid date format. Please use DD/MM/YYYY");
    return;
  }

  const utcDate = dateMoment.toDate();
  const booking = await Bookings.find({ day: findSchedule.day, date: utcDate });

  if (booking.length >= findSchedule.maximumAppointments) {
    res.status(404).send("No empty slots left for this day");
    return;
  }

  const currentDate = new Date();
  const dayOfWeek = moment(utcDate).format("dddd");

  if (utcDate < currentDate) {
    return res.status(400).send("Booking date cannot be in the past.");
  }
  if (dayOfWeek !== findSchedule.day) {
    return res
      .status(400)
      .send("The slot day does not fall within the doctor's schedule");
  }
  try {
    const newBooking = new Bookings({
      date: utcDate,
      doctor,
      schedule,
      startTime: findSchedule.startTime,
      endTime: findSchedule.endTime,
      day: findSchedule.day,
      user,
      status: "booked",
    });
    // Save the new booking to the database
    await newBooking.save();
    // Set a timeout to change the booking status to "confirmed" 24 hours before the start time
    const startTime = moment(
      `${date} ${findSchedule.startTime}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    const reminderTime = startTime.subtract(2, "hours");

    setTimeout(async () => {
      const bookings = await Bookings.findOne({ _id: newBooking._id });
      if (bookings.status === "booked" && moment().isAfter(reminderTime)) {
        sendNotification(
          "Upcoming appointment",
          `You have an appointment with Dr. ${findDoctor.name} in 2 hours`,
          req.user.id
        );
      }
    }, reminderTime - moment());

    // Set a timeout to change the booking status to "confirmed" 24 hours before the start time
    setTimeout(async () => {
      const bookings = await Bookings.findOne({ _id: newBooking._id });
      if (
        bookings.status === "booked" &&
        moment().isAfter(startTime.subtract(24, "hours"))
      ) {
        booking.status = "confirmed";
        await bookings.save();
      }
    }, startTime.subtract(24, "hours") - moment());

    // Update the currentAppointment field of findSchedule by 1
    await Users.updateOne(
      { _id: doctor, "schedule._id": schedule },
      { $inc: { "schedule.$.currentAppointments": 1 } }
    );

    res.json(newBooking);

    sendNotification(
      "Slot booked",
      `You have booked slot for Dr. ${findDoctor.name} `,
      req.user.id
    );
  } catch (error) {
    res.json(error);
  }
};

const changeAdminBooking = async (req, res) => {
  const status = req.body.status;
  const booking = await Bookings.findById(req.params.id);
  const doctor = booking.doctor;
  const schedule = booking.schedule;
  if (status === "cancelled") {
    await Users.updateOne(
      { _id: doctor, "schedule._id": schedule },
      { $inc: { "schedule.$.currentAppointments": -1 } }
    );
  }
  await Bookings.findByIdAndUpdate(
    req.params.id,
    { status: status },
    { new: true }
  )
    .then((booking) => {
      res.json(booking);
    })
    .catch((error) => {
      res.json(error);
    });
};

const cancelUserBooking = async (req, res) => {
  const { id, userId } = req.params;
  const booking = await Bookings.findById(id);

  const schedule = booking.schedule;
  const doctor = booking.doctor;

  if (booking.status === "cancelled" || booking.status === "confirmed") {
    res
      .status(404)
      .send("Cannot cancel already cancelled or confirmed booking");
  }
  const currentDate = new Date();
  if (booking.date <= currentDate) {
    res.status(404).send("Cannot cancel booking before 24 hours.Contact admin");
  }

  await Users.updateOne(
    { _id: doctor, "schedule._id": schedule },
    { $inc: { "schedule.$.currentAppointments": -1 } }
  );
  await Bookings.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true }
  ).then(async () => {
    const bookings = await Bookings.find({
      status: "booked",
      user: userId,
    });
    const bookingsWithDoctor = await Promise.all(
      bookings.map(async (booking) => {
        if (!booking) {
          // check if booking is null or undefined
          return null;
        }
        const doctorDetails = await Users.findById(booking.doctor);

        return {
          ...booking.toJSON(),
          doctorDetails,
        };
      })
    );
    res.json(bookingsWithDoctor);
  });
};

const getTodayBooking = async (req, res) => {
  const currentDate = moment().utc().startOf("day");
  const bookings = await Bookings.find({
    date: { $gte: currentDate.toDate() },
  });
  res.json(bookings);
};

module.exports = {
  getAllBookings,
  createBooking,
  getBookedData,
  getPastData,
  changeAdminBooking,
  getTodayBooking,
  cancelUserBooking,
};
