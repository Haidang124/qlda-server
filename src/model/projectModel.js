const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var projectSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    avatar: {
      type: String,
      default:
        "https://tuoitredoisong.net/wp-content/uploads/2019/10/dich-Project-la-gi-trong-tieng-viet.jpg",
    },
    chat: { type: Array, default: [] },
    admin: { type: Array, default: [] },
    userJoin: { type: Array, default: [] },
  },
  { timestamps: true }
);
projectSchema.statics.userJoin = async function (userId, projectId) {
  var listUser = await (await this.findOne({ _id: projectId })).get("userJoin");
  if (listUser.indexOf(userId) === -1) {
    listUser.push(userId);
  } else {
    throw Error("User đã tham gia project");
  }
  var query = await this.updateOne(
    { _id: projectId },
    {
      $set: {
        userJoin: listUser,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Không thể tham gia project!");
};
projectSchema.statics.userOut = async function (userId, projectId) {
  var listUser = await (await this.findOne({ _id: projectId })).get(
    "userJoin"
  );
  if (listUser.indexOf(userId) != -1) {
    listUser.splice(listUser.indexOf(userId), 1);
  } else {
    throw Error("Không tồn tại project");
  }
  var query = await this.updateOne(
    { _id: projectId },
    {
      $set: {
        userJoin: listUser,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Không thể tham gia project!");
};
const Project = mongoose.model("project", projectSchema);

module.exports = Project;
