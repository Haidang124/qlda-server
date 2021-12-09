import Project from "../model/projectModel";

const userJoin = async (userId, projectId) => {
  var listUser = await (
    await Project.findOne({ _id: projectId })
  ).get("userJoin");
  if (listUser.indexOf(userId) === -1) {
    listUser.push(userId);
  } else {
    throw Error("User đã tham gia project");
  }
  var query = await Project.updateOne(
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
const userOut = async (userId, projectId) => {
  var listUser = await (
    await Project.findOne({ _id: projectId })
  ).get("userJoin");
  if (listUser.indexOf(userId) != -1) {
    listUser.splice(listUser.indexOf(userId), 1);
  } else {
    throw Error("Không tồn tại project");
  }
  var query = await Project.updateOne(
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
export const projectRepository = {
  userJoin,
  userOut,
};
