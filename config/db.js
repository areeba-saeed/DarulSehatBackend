const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
    });
    console.log(`Mongoose Connected ${conn.connection.host}`);
  } catch (error) {
    console.log(`Failed`, error);
  }
};

module.exports = {
  connectDB,
  JWT_SECRET: process.env.JWT_SECRET,
};
