const mongoose = require("mongoose");

// creating schema in mongoose for the authentication....

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


//creating models

const User = mongoose.model('user',userSchema)

module.exports = User;