const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var fileSchema = Schema(
  {
    content: { type: String },
    link: { type: String },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);
const File = mongoose.model("File", fileSchema);

module.exports = File;
