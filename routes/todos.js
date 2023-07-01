const express = require("express");
const router = express.Router();
const todoCtrl = require("../controllers/todos");

// Index/ todos
router.get("/", todoCtrl.notCompletedTodo);
// Index /todos/completed
router.get("/completed", todoCtrl.completedTodo);
// Delete /todos/:id
router.delete("/:id", todoCtrl.delete);
// Update /todos/:id
router.put("/:id", todoCtrl.update);
// Create /todos
router.post("/", todoCtrl.create);
// Show /todos/:id
router.get("/:id", todoCtrl.show);

module.exports = router;
