const mongoose = require("mongoose");
const { Reaction } = require("../enum");
var Schema = mongoose.Schema;
var reactionSchema = Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    type: {
      type: String,
      enum: ["Like", "Love", "Wow", "Sad", "Happy", "Cry", "Angry"],
    },
  },
  { timestamps: true }
);
const Reaction = mongoose.model("Reaction", reactionSchema);

module.exports = Reaction;
