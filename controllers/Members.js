const Users = require("../models/Users");
const bcrypt = require("bcryptjs");

const updateMember = async (req, res) => {
  try {
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    await Users.findOne(
      { _id: req.params.id, role: { $in: ["pharmacy", "lab"] } },
      {
        password: hashPassword,
      },
      { new: true }
    );

    res.send("Member info changed successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const updateAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    await Users.findOneAndUpdate(
      { _id: req.params.id, role: "admin" },
      {
        password: hashPassword,
      },
      { new: true }
    );

    res.send("Member info changed successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { updateMember, updateAdmin };
