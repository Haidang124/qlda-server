const mongoose = require("mongoose");
var Schema = mongoose.Schema;

/**
 * content, deadline: {from, to}, type: ["task", "post"], authorId
 */
var notificationSchema = Schema(
  {
    content: { type: String },
    deadline: {
      from: { type: Date, default: null },
      to: { type: Date, default: null },
    },
    type: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
