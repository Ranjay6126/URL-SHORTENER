const mongoose = require("mongoose");

// ================= ADMIN NOTIFICATIONS =================
// Every short link created by a NORMAL user (i.e. anyone who is not the
// ADMIN_EMAIL) is recorded here so the admin (panditranjay33@gmail.com)
// can see who created what, from which IP address, and when.
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "url_created",
    },
    // who created the link
    userName: {
      type: String,
      default: "",
    },
    userEmail: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    // what was created
    shortId: {
      type: String,
      required: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    // where from
    ip: {
      type: String,
      default: "",
    },
    // MAC-style device id of the creator's browser
    mac: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;