const Project = require("../model/projectModel");
const User = require("../model/userModel");
const Chat = require("../model/chatModel");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
module.exports.addChat = async (req, res) => {
  let { projectId, friendId, content } = req.body;
  let project = await Project.findById(projectId);
  let friend = await User.findById(friendId);
  let userId = await getCurrentId(req);
  let user = await User.findById(userId);
  if (friend) {
    if (JSON.stringify(friend._id) === JSON.stringify(user._id)) {
      return handleErrorResponse(res, 400, "Chưa gửi được tin nhắn");
    }
  }
  if (project || friend) {
    var chat = new Chat({
      userId: userId,
      friendID: friendId,
      projectId: projectId,
      content: content,
    });
    chat.save(async function (err, obj) {
      if (err) {
        return handleErrorResponse(res, 400, null, "Chưa gửi được tin nhắn");
      }
    });
  }
  if (project) {
    project.chats.push(chat);
    await project.save();
    await Project.findById(projectId)
      .populate({
        path: "chats",
        populate: { path: "userId", select: ["username", "avatar"] },
      })
      .then((project) => {
        return handleSuccessResponse(res, 200, project.chats, "Thành công");
      });
  } else if (friend) {
    user.friendChat.push(chat);
    friend.friendChat.push(chat);
    await user.save();
    await friend.save();
    await User.findById(userId)
      .populate({
        path: "friendChat",
        populate: [
          { path: "friendID", select: ["username", "avatar"] },
          { path: "userId", select: ["username", "avatar"] },
        ],
      })
      .then((user) => {
        return handleSuccessResponse(res, 200, user.friendChat, "Thành công");
      });
  }
};
module.exports.getListChat = async (req, res) => {
  let userId = await getCurrentId(req);
  if (userId) {
    await User.findById(userId)
      .populate([
        {
          path: "friendChat",
          populate: [
            { path: "friendID", select: ["username", "avatar"] },
            { path: "userId", select: ["username", "avatar"] },
          ],
        },
        {
          path: "projects",
          populate: {
            path: "users",
            select: "username avatar role email",
          },
          select: ["name", "avatar", "users"],
        },
      ])
      .then((user) => {
        let friendChat = [];
        user.friendChat.forEach((element) => {
          if (JSON.stringify(userId) === JSON.stringify(element.userId._id)) {
            if (!friendChat.includes(element.friendID)) {
              friendChat.push(element.friendID);
            }
          } else {
            if (!friendChat.includes(element.userId)) {
              friendChat.push(element.userId);
            }
          }
        });
        const ids = friendChat.map((o) => o.id);
        friendChat = friendChat.filter(
          ({ id }, index) => !ids.includes(id, index + 1)
        );
        return handleSuccessResponse(
          res,
          200,
          { friendChat: friendChat, projectChat: user.projects },
          "Thành công"
        );
      })
      .catch(() => {
        return handleErrorResponse(res, 401, "Có lỗi xảy ra");
      });
  }
};
module.exports.getChat = async (req, res) => {
  let { projectId } = req.body;
  let userId = await getCurrentId(req);
  try {
    let project = await Project.findById(projectId);
    if (project) {
      await Project.findById(projectId)
        .populate({
          path: "chats",
          populate: { path: "userId", select: ["username", "avatar"] },
        })
        .then((project) => {
          return handleSuccessResponse(res, 200, project.chats, "Thành công");
        });
    } else {
      await User.findById(userId)
        .populate({
          path: "friendChat",
          populate: [
            { path: "friendID", select: ["username", "avatar"] },
            { path: "userId", select: ["username", "avatar"] },
          ],
        })
        .then((user) => {
          let result = user.friendChat.filter(
            (chat) => chat.friendID._id.toString() === projectId
          );
          return handleSuccessResponse(res, 200, result, "Thành công");
        });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, error);
  }
};
module.exports.removeChat = async (req, res) => {};
