const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var projectSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    admin: {type: Array, default:[]},
    userJoin: {type: Array, default: []},
    avatar: {type: String, default: "https://tuoitredoisong.net/wp-content/uploads/2019/10/dich-Project-la-gi-trong-tieng-viet.jpg"},
    description: {type: String, default: ""}
  },
  { timestamps: true }
);
projectSchema.statics.userJoin = async (userId, projectId) => {
  var listUser = await (await projectSchema.findOne({_id: projectId})).get("userJoin");
  listUser.push(userId);
  var query = await projectSchema.updateOne(
    {_id: projectId},
    {
      $set: {
        userJoin: listUser
      }
    }
  )
  if(query){
    return query;
  } throw Error("Không thể tham gia project!");
}
projectSchema.statics.userOut = async (userId, projectId) => {
  var listUser = await (await projectSchema.findOne({_id: projectId})).get("userJoin");
  if(listUser.indexOf(userId)) {
    listUser.splice(listUser.indexOf(userId),1);
  } else {
    throw Error("Không tồn tại project");
  }
  var query = await projectSchema.updateOne(
    {_id: projectId},
    {
      $set: {
        userJoin: listUser
      }
    }
  )
  if(query){
    return query;
  } throw Error("Không thể tham gia project!");
}
const Project = mongoose.model("project", projectSchema);

module.exports = Project;
