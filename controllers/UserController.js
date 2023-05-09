const Users = require("../models/Users");
const bcrypt = require("bcryptjs");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const getUsers = async (req, res) => {
  const users = await Users.find({ role: "patient" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  Users.findByIdAndDelete(req.params.id)
    .then(async () => {
      const users = await Users.find({ role: "patient" });
      res.json(users);
    })
    .catch((error) => {
      res.json(error);
    });
};

const updateUser = async (req, res) => {
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  await Users.findByIdAndUpdate(
    req.params.id,
    { password: hash },
    { new: true }
  )
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.json(error);
    });
};

const blockUser = async (req, res) => {
  const block = req.body.block;
  Users.findByIdAndUpdate(req.params.id, { block: block }, { new: true })
    .then(async () => {
      const users = await Users.find({ role: "patient" });
      res.json(users);
    })
    .catch((error) => {
      res.json(error);
    });
};

const allBlockedUsers = async (req, res) => {
  const users = await Users.find({ block: true });
  res.json(users);
};

const getNotification = async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const users = await Users.find({ role: "patient", block: false });
  const pushTokens = users
    .map((user) => user.deviceToken)
    .filter((token) => token !== undefined);

  const messages = pushTokens.map((pushToken) => ({
    to: pushToken,
    sound: "default",
    title: `${title}`,
    body: `${description}`,
    data: {
      title: `${title}`,
      message: `${description}`,
      customKey: "customValue",
      // Add any other data you want to send to the app
    },
    // Customize the notification appearance
    ios: {
      sound: true,
      badge: true,
      priority: "high",
      channel_id: "my-channel-id",
      data: { foo: "bar" },
      _displayInForeground: true,
      // Add any other customization for iOS
    },
    android: {
      sound: true,
      vibrate: true,
      priority: "high",
      channelId: "my-channel-id",
      data: { foo: "bar" },
      color: "#ff0000",
      icon: "ic_launcher",
      // Add any other customization for Android
    },
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  const sendNotifications = async () => {
    // Send the chunks of messages
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    // Get the receipt of the sent messages
    const receiptIds = tickets.map((ticket) => ticket.id);
    const receipt = await expo.getPushNotificationReceiptsAsync(receiptIds);

    // Handle the receipt
    for (const [id, status] of Object.entries(receipt)) {
      if (status.status === "error") {
        console.error(
          `There was an error sending a notification with ID ${id}: ${status.message}`
        );
      }
    }
  };

  sendNotifications();
};

module.exports = {
  getUsers,
  deleteUser,
  blockUser,
  updateUser,
  allBlockedUsers,
  getNotification,
};
