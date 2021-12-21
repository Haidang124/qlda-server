const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var blogSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    describe: { type: String },
    content: { type: String },
    security: { type: String, default: "Public" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
  },
  { timestamps: true }
);
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
