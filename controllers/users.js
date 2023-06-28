require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  // to make sure the user is authorized to do something
  try {
    const token = req.header("Authorization").replace("Bearer", ""); // take the token out of the authorization header
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
      res.json({ user, token });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = Object.keys(req.body); // we make an array of all the keys of all the things we want to change about the user, req.body is an object with a bunch of keys in it
    //because in order to update the user needs to be authenticated, we already have the req.user from the authentication part
    updates.forEach((update) => (req.user[update] = req.body[update])); // we call for each on the keys array, take that particular in the user and change it for the data inside req.body
    await req.user.save(); // save user with the changes made in the database
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
