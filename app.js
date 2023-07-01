const userController = require("./controllers/users");
const express = require("express");
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const todoRoutes = require("./routes/todos");
const app = express();

app.use(express.json());
app.use(morgan("combined"));
app.use("/users", userRoutes);
app.use("/todos", userController.auth, todoRoutes);

module.exports = app;
