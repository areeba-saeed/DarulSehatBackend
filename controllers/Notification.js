const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const Users = require("../models/Users");

const sendNotification = async (title, body, id) => {
  try {
    const user = await Users.findById(id);
    if (!user) throw new Error("User not found");

    const pushToken = user.deviceToken;
    if (!pushToken) throw new Error("Device token not found");

    const message = {
      to: pushToken,
      sound: "default",
      title: `${title}`,
      body: `${body}`,
      data: {
        title: `${title}`,
        message: `${body}`,
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
    };

    const ticket = await expo.sendPushNotificationsAsync([message]);

    if (ticket.status === "error") {
      console.error(
        `There was an error sending a notification: ${ticket.message}`
      );
    } else {
      console.log(`Notification sent to user ${user._id}`);
    }
  } catch (error) {
    console.error(error);
    console.log("unscuess");
  }
};

module.exports = { sendNotification };
