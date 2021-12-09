const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var confirmMail = Schema(
  {
    projectId: { type: Schema.Types.ObjectId},
    userInvite: { type: Schema.Types.ObjectId, ref: "User"},
    userInvited: { type: Schema.Types.ObjectId, ref: "User"},
  },
  { timestamps: true }
);
const Comment = mongoose.model("ConfirmMail", confirmMail);

module.exports = Comment;