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
    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }], // this ref will point to the 'Todo' string collection in the todo.js
    isLoggedIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // before the docs get saved in the database, we want to check if the password was updated
  this.isModified("password") // when the user password gets updated, we want bcrypt to hash the new password before it's saved
    ? (this.password = await bcrypt.hash(this.password, 8))
    : null;

  next();
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET); // we can call on this method to generate a token every time we need it
  return token;
};

const User = mongoose.model("User", userSchema); // creates a model that provides an interface with mongodb collection to perform CRUD operations

module.exports = User; // exports the User model as a module, making it available for other parts of the application to import and use..
