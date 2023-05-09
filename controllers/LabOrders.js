const LabOrders = require("../models/LabOrders");
const LabTests = require("../models/LabTests");
const Users = require("../models/Users");
const { sendNotification } = require("./Notification");

const getAllOrders = async (req, res) => {
  try {
    const orders = await LabOrders.find();
    // // Merge user data with orders
    const ordersWithUserData = await Promise.all(
      orders.map(async (order) => {
        const user = await Users.findById(order.user);
        return {
          ...order.toObject(),
          user,
        };
      })
    );

    const updatedLabOrders = await Promise.all(
      ordersWithUserData.map(async (labOrder) => {
        if (labOrder.tests && labOrder.tests.length > 0) {
          const updatedTests = await Promise.all(
            labOrder.tests.map(async (test) => {
              const lab = await LabTests.findOne({
                _id: test.test,
                isActive: true,
              });

              if (lab) {
                const testDetails = {
                  test: lab,
                  quantity: test.quantity,
                };
                return testDetails;
              } else {
                return test;
              }
            })
          );
          const updatedLabOrder = {
            ...labOrder,
            tests: updatedTests,
          };
          return updatedLabOrder;
        } else {
          return labOrder;
        }
      })
    );
    res.json(updatedLabOrders);
  } catch (error) {
    res.json(error);
  }
};

const getUserLabPending = async (req, res) => {
  const userId = req.params.userId;
  const orders = await LabOrders.find({
    status: { $in: ["new-order", "in-process"] },
    user: userId,
  });
  res.json(orders);
};
const getUserLabRemaining = async (req, res) => {
  const userId = req.params.userId;
  const orders = await LabOrders.find({
    user: userId,
    status: { $nin: ["new-order", "in-process"] },
  });
  res.json(orders);
};

const createLabOrder = async (req, res) => {
  const { tests, other } = req.body;
  const user = req.user.id;
  const { name, phoneNo, age, gender, zip, street, state, city } = req.body;
  const address = { zip: zip, street: street, state: state, city: city };

  if (!user) {
    res.status(404).send("User not found");
  }

  let patientDetails = [];

  if (other === "true") {
    patientDetails = { name, age, gender, phoneNo, address };
  } else {
    patientDetails = null;
  }

  const images = req.files ? req.files.map((file) => file.filename) : [];

  const newOrder = new LabOrders({
    user: user,
    tests: tests,
    images: images,
    other: other,
    patientDetails: patientDetails,
    // homeVisitCharges: homeVisitCharges,
    status: "new-order",
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

  const order = await LabOrders.findById(id);
  if (
    order.status === "in-process" ||
    order.status === "cancelled" ||
    order.status === "completed"
  ) {
    res
      .status(404)
      .send("Cannot cancel already in-process completed or cancelled order");
  }
  await LabOrders.findByIdAndUpdate(id, { status: "cancelled" }, { new: true })
    .then(async () => {
      const orders = await LabOrders.find({
        status: { $in: ["new-order", "in-process"] },
        user: userId,
      });
      res.json(orders);
    })
    .catch((error) => {
      res.json(error);
    });
};

const changeStatus = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status;
  const order = await LabOrders.findById(id);

  if (order.status === status) {
    res.status(404).send(`Order is already ${status}`);
  }
  await LabOrders.findByIdAndUpdate(id, { status: status }, { new: true }).then(
    async () => {
      const orders = await LabOrders.find();
      res.json(orders);
    }
  );
};

const uploadOrder = async (req, res) => {
  const { totalPrice } = req.body;
  await LabOrders.findByIdAndUpdate(
    req.params.id,
    {
      status: "in-process",
      totalPrice: totalPrice,
    },
    { new: true }
  )
    .then((order) => {
      res.json(order);
    })
    .catch((error) => {
      res.json(error);
    });
};

const uploadResult = async (req, res) => {
  const result = req.files ? req.files.map((file) => file.filename) : [];
  await LabOrders.findByIdAndUpdate(
    req.params.id,
    {
      status: "completed",
      result: result,
    },
    { new: true }
  )
    .then((order) => {
      res.json(order);
      sendNotification("Result", "Result has been uploaded", req.user.id);
    })
    .catch((error) => {
      res.json(error);
    });
};

module.exports = {
  getAllOrders,
  getUserLabPending,
  getUserLabRemaining,
  createLabOrder,
  cancelOrder,
  changeStatus,
  uploadResult,
  uploadOrder,
};
