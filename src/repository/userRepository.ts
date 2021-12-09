const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};
const updateFields = async (user_id, data) => {
  // data: {newUsername, newAvatar, newLanguage, newBirthday}
  const query = await User.updateOne(
    { _id: user_id },
    {
      $set: {
        username: data.newUsername,
        avatar: data.newAvatar,
        language: data.newLanguage,
        birthday: data.newBirthday,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Update error!");
};
const createProject = async (userId, projectId) => {
  var listProject = await (
    await User.findOne({ _id: userId })
  ).get("projectCreated");
  listProject.push(projectId);
  const query = await User.updateOne(
    { _id: userId },
    {
      $set: {
        projectCreated: listProject,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Create error");
};
const deleteProjectCreated = async (userId, projectId) => {
  var listProject = await (
    await User.findOne({ _id: userId })
  ).get("projectCreated");
  if (listProject.indexOf(projectId) != -1) {
    listProject.splice(listProject.indexOf(projectId), 1);
  } else {
    throw Error("Không tồn tại project");
  }
  const query = await User.updateOne(
    { _id: userId },
    {
      $set: {
        projectCreated: listProject,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Create error");
};
const joinProject = async (userId, projectId) => {
  var listProject = await (
    await User.findOne({ _id: userId })
  ).get("projectJoin");
  if (listProject.indexOf(projectId) === -1) {
    listProject.push(projectId);
  } else {
    throw Error("Project đã tồn tại User");
  }
  const query = await User.updateOne(
    { _id: userId },
    {
      $set: {
        projectJoin: listProject,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Create error");
};
const outProject = async (userId, projectId) => {
  var listProject = await (
    await User.findOne({ _id: userId })
  ).get("projectJoin");
  if (listProject.indexOf(projectId) != -1) {
    listProject.splice(listProject.indexOf(projectId), 1);
  } else {
    throw Error("Không tồn tại project");
  }
  const query = await User.updateOne(
    { _id: userId },
    {
      $set: {
        projectJoin: listProject,
      },
    }
  );
  if (query) {
    return query;
  }
  throw Error("Create error");
};
const changePassword = async (user_id, _newPassword) => {
  const salt = await bcrypt.genSalt();
  const newPassword = await bcrypt.hash(_newPassword, salt);
  const query = await User.updateOne(
    { _id: user_id },
    { $set: { password: newPassword } }
  );
  if (query) {
    return query;
  }
  throw Error("Update password ERROR!");
};

const checkNewData = async (data) => {
  // data {newUsername, newAvatar, newLanguage, newBirthday, }
  if (data.newUsername === "") throw Error("ERROR! Username empty");
  if (data.newAvatar === "") {
    data.newAvatar =
      "https://api.hoclieu.vn/images/game/bbfb3597f173af631cb24f6ee0f8b8da.png";
  }
  if (data.newLanguage === "") {
    data.newLanguage = "vi";
  }
  if (data.newBirthday === "") {
    data.newBirthday = new Date("2000-01-01"); // 01-01-2000
  } else {
    data.newBirthday = new Date(data.newBirthday); // month = [0;11];
  }
  return data;
};
const updateGameIdArray = async (userId, gameIdArray) => {
  const result = await User.updateOne(
    { _id: userId },
    { $set: { gameIdArray: gameIdArray } }
  );
  if (result) {
    return true;
  }
  throw Error("ERROR! Don't update game");
};
export const userRepository = {
  login,
  updateFields,
  createProject,
  deleteProjectCreated,
  joinProject,
  outProject,
  changePassword,
  checkNewData,
  updateGameIdArray,
};
