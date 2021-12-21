const mongoose = require("mongoose");
var Schema = mongoose.Schema;

/**
 * content, deadline: {from, to}, type: ["task", "post"], authorId
 */
var notificationSchema = Schema(
  {
    content: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, default: "add-assingment" },
    // add-assingment, del-assingment, new-chat, project-invite, project-refuse, project-agree, project-refuse-invited, project-agree-invited
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
