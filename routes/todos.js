const express = require("express");
const router = express.Router();
const todoCtrl = require("../controllers/todos");

// Create /todos
router.post("/", todoCtrl.create);
// Index/ todos
router.get("/", todoCtrl.getAll);
router.get("/unfinished", todoCtrl.notCompletedTodo);
// Index /todos/completed
router.get("/completed", todoCtrl.completedTodo);
// Delete /todos/:id
router.delete("/:id", todoCtrl.delete);
// Update /todos/:id
router.put("/:id", todoCtrl.update);
// Show /todos/:id
router.get("/:id", todoCtrl.show);
router.get("/user/:id", todoCtrl.showAllUserTodos);

module.exports = router;
