const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var chatSchema = Schema(
  {
    content: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    friendID: { type: Schema.Types.ObjectId, ref: "User" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
