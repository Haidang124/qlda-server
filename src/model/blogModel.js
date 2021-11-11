const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var blogSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    security: { type: String, default: "Public" },
    content: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
