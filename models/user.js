require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema( // schema to create new users, each user is a document inside our database
  {
    name: { type: String, required: true },
    nickName: { type: String, required: false },
    age: { type: Number, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  this.isModified("password") // when the user password gets updated, we want bcrypt to hash the new password
    ? (this.password = await bcrypt.hash(this.password, 8))
    : null;

  next();
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET); // we can call on this method to generate a token
  return token;
};
