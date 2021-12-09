const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var taskSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    dependenciesTask: { type: Schema.Types.ObjectId, ref: "Task" },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    assignment: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    name: { type: String, default: "New Task" },
    description: { type: String, default: "This is new task" },
    files: {
      type: [{ type: Schema.Types.ObjectId, ref: "File" }],
      default: [],
    },
    dueDate: { from: { type: Date }, to: { type: Date } },
    isDone: { type: Boolean, default: false },
    labels: {
      type: [{ type: Schema.Types.ObjectId, ref: "Label" }],
      default: [],
    },
  },
  { timestamps: true }
);
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
