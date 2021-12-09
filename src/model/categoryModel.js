const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var categorySchema = Schema(
  {
    name: { type: String },
    blogs: {
      // listBlog
      type: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
      default: [],
    },
  },
  { timestamps: true }
);
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
