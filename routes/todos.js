const express = require("express");
const router = express.Router();
const todoCtrl = require("../controllers/todos");

// Create /todos
router.post("/", todoCtrl.create);
// Index/ unfinished todos
router.get("/unfinished", todoCtrl.notCompletedTodo);
// Delete /todos/:id
router.delete("/:id", todoCtrl.delete);
// Update /todos/:id
router.put("/:id", todoCtrl.update);
// Show /todos/:id
router.get("/:id", todoCtrl.show); // get a specific todo, where id is the todo_id
router.get("/user/:id", todoCtrl.showAllUserTodos); // get all todos for a user , where id is the user_id

module.exports = router;
