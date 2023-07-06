require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  // to make sure the user is authorized to do something
  try {
    const token = req.header("Authorization").replace("Bearer ", ""); // take the token out of the authorization header
    const data = jwt.verify(token, process.env.SECRET); // verify that the token it's valid. if it's valid then we get the id of the user
    const user = await User.findOne({ _id: data._id }); // we're going to take the id inside the jwt and use it to lookup the user in the database
    if (!user) {
      throw new Error("Unauthorized Credentials");
    }
    req.user = user; // store the user inside req.user to use it in subsequent functions
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body); // we get req.body from the user, email and password, then we make a new instance of a user
    await user.save(); //  we save that user document to the database
    const token = await user.generateAuthToken(); // we generate a token using the generateAuthToken() middleware
    res.json({ user, token }); // we send back to the user the user object and the created token
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }); // lookup the user in the database with their email, req.body.email is what the user sends to us
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error("Invalid login credentials"); // if the user email is not found or the password provided does not match the one in the database
    } else {
      const token = await user.generateAuthToken(); // if we do find the user, we get back a user document on which we can use the generateAuthToken method
      user.isLoggedIn = true;
      user.save();

      res.json({ user, token });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const user = await User.findOne({ _id: req.params.id });
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    await req.user.deleteOne(); // we have a req.user because we took it out of the token and saved it in user
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    user = req.user;
    user.isLoggedIn = false;
    await user.save();
    res.json({ message: "User successfully logged out!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// get user by their user_id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
