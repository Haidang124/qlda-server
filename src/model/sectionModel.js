const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var sectionSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String },
    tasks: {
      type: [{ type: Schema.Types.ObjectId, ref: "Task" }],
      default: [],
    },
  },
  { timestamps: true }
);
const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
