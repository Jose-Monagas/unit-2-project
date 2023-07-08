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

// Find all todos for a user
exports.showAllUserTodos = async function (req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id });
    const todos = await Todo.find({ userEmail: user.email });
    res.json(todos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Not Completed todos
exports.notCompletedTodo = async function (req, res) {
  try {
    const todos = await Todo.find({
      completed: false,
      userEmail: req.user.email,
    });

    res.json(todos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// update todo
exports.update = async function (req, res) {
  try {
    const todos = await Todo.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(todos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// delete todo
exports.delete = async function (req, res) {
  try {
    const todos = await Todo.findOneAndDelete({ _id: req.params.id });
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
