const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var postSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    content: { type: String },
    files: {
      type: [{ type: Schema.Types.ObjectId, ref: "File" }],
      default: [],
    },
    reactions: {
      type: [{ type: Schema.Types.ObjectId, ref: "Reaction" }],
      default: [],
    },
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
