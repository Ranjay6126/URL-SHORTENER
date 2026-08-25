const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    // who created this short link (logged in user)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    // creation snapshot shown on the admin dashboard:
    // who made it and from which IP address
    creatorName: {
      type: String,
      default: "",
    },
    creatorEmail: {
      type: String,
      default: "",
    },
    creatorIp: {
      type: String,
      default: "",
    },
    // MAC-style device id of the browser that created this link
    creatorMac: {
      type: String,
      default: "",
    },
    creatorUserAgent: {
      type: String,
      default: "",
    },
    visitHistory: [
      {
        timestamp: { type: Number },
        // IP address of the visitor that clicked the short link
        ip: {
          type: String,
          default: "",
        },
        // MAC-style device id of the visitor's browser
        mac: {
          type: String,
          default: "",
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const URL = mongoose.model("url", UrlSchema);

module.exports = URL;
