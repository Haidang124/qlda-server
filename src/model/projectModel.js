const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var projectSchema = Schema(
  {
    userAdmin: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    name: { type: String },
    avatar: {
      type: String,
      default:
        "https://tuoitredoisong.net/wp-content/uploads/2019/10/dich-Project-la-gi-trong-tieng-viet.jpg",
    },
    training: {
      type: [
        {
          type: { type: String },
          link: { type: String },
          blogId: { type: Schema.Types.ObjectId, ref: "Blog" },
        },
      ],
      default: [],
    },
    chats: {
      type: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
      default: [],
    },
    posts: {
      type: [{ type: Schema.Types.ObjectId, ref: "Post" }],
      default: [],
    },
    sections: {
      type: [{ type: Schema.Types.ObjectId, ref: "Section" }],
      default: [],
    },
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    labels: {
      type: [{ type: Schema.Types.ObjectId, ref: "Label" }],
      default: [],
    },
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
  var listUser = await (await this.findOne({ _id: projectId })).get("userJoin");
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
const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
