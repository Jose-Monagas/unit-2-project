const Todo = require("../models/todo"); // everything here will happen for authenticated users so we'll always know what req.user is
const User = require("../models/user");

// Create a todo
exports.create = async function (req, res) {
  try {
    req.body.userEmail = req.user.email;
    const todo = await Todo.create(req.body);
    req.user.todos // does the user have any todos ?
      ? req.user.todos.addToSet({ _id: todo._id }) // if it does then add the new to do to that list
      : (req.user.todos = [{ _id: todo._id }]); // if it does not exist then create a new array and drop todo._id there
    await todo.save(); // needs to be saved before saving the user
    await req.user.save(); // save the changes to the database
    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Find an individual todo
exports.show = async function (req, res) {
  try {
    const todo = await Todo.findOne({ _id: req.params.id });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Completed todos
exports.completedTodo = async function (req, res) {
  try {
    const todos = await Todo.find({ completed: true, user: req.user._id });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Not Completed todos
exports.notCompletedTodo = async function (req, res) {
  try {
    const todos = await Todo.find({ completed: false, user: req.user._id });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async function (req, res) {
  try {
    const todos = await Todo.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async function (req, res) {
  try {
    const todos = await Todo.findOneAndDelete({ _id: req.params.id });
    res
      .status(200)
      .send("Request processed successfully, todo has been deleted");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
