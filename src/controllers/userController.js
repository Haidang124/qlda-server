const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
  test,
} = require("../helper/responseHelper");
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "ptud web", {
    expiresIn: maxAge,
  });
};
exports.deleteCurrentUser = async (req, res) => {
  let message;
  let id = await getCurrentId(req);
  User.remove({ _id: id }, function (err) {
    if (!err) {
      message = "xóa thành công!";
    } else {
      message = "Xảy ra lỗi";
    }
  });
  handleSuccessResponse(res, 200, { status: message });
};
exports.getNameAndAvatar = async (id) => {
  let author = {};
  let user = await User.findById({ _id: id });
  if (user) {
    author.authorId = user.toObject()._id;
    author.name = user.toObject().username;
    author.avatar = user.toObject().avatar;
  }
  return author;
};
module.exports.getUser = (req, res, next) => {};
module.exports.loginUser = async (req, res) => {
  ``;
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
      // sameSite: "none",
    });
    // localStorage.setItem("token", "token123");
    return handleSuccessResponse(
      res,
      200,
      { userId: user.id, token: token },
      "Đăng nhập thành công !"
    );
  } catch (error) {
    return handleErrorResponse(res, 400, "Đăng nhập thất bại !");
  }
};
module.exports.signUp = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const user = await User.create({ email, username, password });
    return handleSuccessResponse(
      res,
      200,
      { userId: user.id },
      "Đăng kí thành công !"
    );
  } catch (err) {
    return handleErrorResponse(res, 400, "Đăng kí thất bại !");
  }
};

module.exports.updateAccount = async (req, res) => {
  const data = req.body; //{newUsername, newAvatar, newLanguage, newBirthday, }

  const user_id = await getCurrentId(req);
  try {
    let new_data = await User.checkNewData(data);
    const query = await User.updateFields(user_id, new_data);
    return handleSuccessResponse(
      res,
      200,
      { userId: user_id },
      "Update thành công!"
    );
  } catch (error) {
    return handleErrorResponse(res, 400, error.message);
  }
};

module.exports.getCurrentUser = async (req, res) => {
  let id = await getCurrentId(req);
  handleSuccessResponse(res, 200, { id: id });
};

module.exports.logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return handleSuccessResponse(res, 200, {}, "Đăng xuất thành công!");
  } catch (error) {
    return handleErrorResponse(res, 400, "Đăng xuất thất bại!");
  }
};

module.exports.changePassword = async (req, res) => {
  const data = req.body; // {oldPassword, newPassword}
  const user_id = await getCurrentId(req);
  const email = await (await User.findOne({ _id: user_id })).get("email");
  if (email) {
    try {
      const user = await User.login(email, data.oldPassword);
      let query = await User.changePassword(user_id, data.newPassword);
      return handleSuccessResponse(
        res,
        200,
        {},
        "Thay đổi password thành công!"
      );
    } catch (error) {
      return handleErrorResponse(
        res,
        400,
        error.message === "incorrect password"
          ? "ERROR! Incorrect current password."
          : error.message
      );
    }
  } else {
    return handleErrorResponse(res, 400, "No Found User");
  }
};

module.exports.getUserInfo = async (req, res) => {
  // return data :{username, email, avatar, language, birthday, role, gameIdArray}
  var ObjectID = require("mongodb").ObjectID;
  try {
    let { userId } = req.query;
    var user_id;
    if (ObjectID.isValid(userId)) {
      user_id = userId;
    } else {
      user_id = await getCurrentId(req);
    }
    if (user_id) {
      const user = await User.findOne({ _id: user_id });
      if (user) {
        return handleSuccessResponse(
          res,
          200,
          {
            role: user.get("role"),
            userId: user_id,
            avatar: user.get("avatar"),
            language: user.get("language"),
            email: user.get("email"),
            username: user.get("username"),
            birthday:
              (user.get("birthday")
                ? String(user.get("birthday").getFullYear())
                : "2000") +
              "-" +
              (user.get("birthday")
                ? String(user.get("birthday").getMonth() + 1) <= "9"
                  ? "0" + String(user.get("birthday").getMonth() + 1)
                  : String(user.get("birthday").getMonth() + 1)
                : "01") +
              "-" +
              (user.get("birthday")
                ? String(user.get("birthday").getDate()) <= "9"
                  ? "0" + String(user.get("birthday").getDate())
                  : String(user.get("birthday").getDate())
                : "01"),
            projects: user.get("projects"),
          },
          "Get User Complate!"
        );
      }
      return handleErrorResponse(res, 400, "Get User ERROR!");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "No Found User");
  }
};
module.exports.getUserName = async function (req, res) {
  try {
    const userId = await getCurrentId(req);
    const username = await (
      await User.findOne({ _id: userId })
    ).get("username");
    return username;
  } catch (error) {
    throw Error(error.message);
  }
};
