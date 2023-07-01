const { model, Schema } = require("mongoose");

const todoSchema = new Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, required: true },
    userEmail: { type: String, required: true }, // this will allow us to say that every time we create a todo it will be linked to a user
    priority: { type: Number, default: 1 },
    dueDate: { type: Date },
    notes: { type: String },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Todo = model("Todo", todoSchema);

module.exports = Todo;
