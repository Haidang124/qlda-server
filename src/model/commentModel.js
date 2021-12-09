const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog" },
    content: { type: String },
  },
  { timestamps: true }
);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
