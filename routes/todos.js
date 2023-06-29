const express = require("express");
const router = express.Router();
const todoCtrl = require("../controllers/todos");
const userController = require("../controllers/users");

// Index/ todos
router.get("/", userController.auth, todoCtrl.notCompletedTodo);
// Index /todos/completed
router.get("/completed", userController.auth, todoCtrl.completedTodo);
// Delete /todos/:id
router.delete("/:id", userController.auth, todoCtrl.delete);
// Update /todos/:id
router.put("/:id", userController.auth, todoCtrl.update);
// Create /todos
router.post("/", userController.auth, todoCtrl.create);
// Show /todos/:id
router.get("/:id", userController.auth, todoCtrl.show);

module.exports = router;
