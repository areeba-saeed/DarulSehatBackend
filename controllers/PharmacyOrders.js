const PharmacyOrders = require("../models/PharmacyOrders");
const Users = require("../models/Users");
const { sendNotification } = require("./Notification");

const getAllPharmacy = async (req, res) => {
  try {
    const orders = await PharmacyOrders.find();

    // // Merge user data with orders
    const ordersWithUserData = await Promise.all(
      orders.map(async (order) => {
        const user = await Users.findById(order.user);
        console.log(order.user);
        return {
          ...order.toObject(),
          user,
        };
      })
    );
    res.json(ordersWithUserData);
  } catch (error) {
    res.json(error);
  }
};

const getUserPharmacyPending = async (req, res) => {
  const userId = req.params.userId;
  const orders = await PharmacyOrders.find({ status: "pending", user: userId });
  res.json(orders);
};
const getUserPharmacyRemaining = async (req, res) => {
  const userId = req.params.userId;
  const orders = await PharmacyOrders.find({
    user: userId,
    status: { $ne: "pending" },
  });
  res.json(orders);
};

const createOrder = async (req, res) => {
  const { medicineNames, paymentMethod } = req.body;
  const user = req.user.id;
  const address = req.user.address;
  // Use multer middleware to handle image uploads

  if (!user) {
    return res.status(400).send("Missing");
  }

  const images = req.files ? req.files.map((file) => file.filename) : [];

  const newOrder = new PharmacyOrders({
    medicineName: medicineNames,
    paymentMethod: paymentMethod,
    user: user,
    images: images,
    address: address,
  });

  newOrder
    .save()
    .then((order) => {
      res.json(order);
      sendNotification(
        "Order placed",
        "You order has been placed",
        req.user.id
      );
    })
    .catch((error) => {
      res.json(error);
    });
};

const cancelOrder = async (req, res) => {
  const { id, userId } = req.params;

  const order = await PharmacyOrders.findById(id);
  if (
    order.status === "confirmed" ||
    order.status === "cancelled" ||
    order.status === "completed"
  ) {
    res
      .status(404)
      .send("Cannot cancel already confirmed completed or cancelled order");
  }
  await PharmacyOrders.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true }
  ).then(async () => {
    const orders = await PharmacyOrders.find({
      status: "pending",
      user: userId,
    });
    res.json(orders);
  });
};

const changeStatusOrder = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status;
  const order = await PharmacyOrders.findById(id);
  if (order.status === status) {
    res.status(404).send(`Order is already in ${status}`);
  }
  await PharmacyOrders.findByIdAndUpdate(
    id,
    { status: status },
    { new: true }
  ).then(async () => {
    const orders = await PharmacyOrders.find();
    res.json(orders);
  });
};

module.exports = {
  getAllPharmacy,
  getUserPharmacyPending,
  getUserPharmacyRemaining,
  createOrder,
  cancelOrder,
  changeStatusOrder,
};
