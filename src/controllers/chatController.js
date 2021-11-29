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
    user.save();
    friend.save();
    await User.findById(userId)
      .populate({
        path: "friendChat",
        populate: {
          path: "_id",
          select: ["content"],
          populate: { path: "userId", select: ["username", "avatar"] },
        },
      })
      .then((user) => {
        return handleSuccessResponse(res, 200, user.friendChat, "Thành công");
      });
  }
};
module.exports.getListChat = async (req, res) => {
  let userId = await getCurrentId(req);
  if (userId) {
    let user = await User.findById(userId)
      .populate([{
        path: "friendChat",
        select: ["friendID"],
        populate: { path: "friendID", select: ["username", "avatar"] }
      }, {
        path: "projects",
        select: ["name", "avatar"]
      }])
      .then((user) => {
        let friendChat = []
        user.friendChat.forEach(element => {
          if (!friendChat.includes(element.friendID)) {
            friendChat.push(element.friendID)
          }
        });
        return handleSuccessResponse(res, 200, { friendChat: friendChat, projectChat: user.projects }, "Thành công");
      })
      .catch(() => {
        return handleErrorResponse(res, 401, "Có lỗi xảy ra");
      })
  }
};
module.exports.getChat = async (req, res) => {
  let { projectId } = req.body;
  let userId = await getCurrentId(req);
  try {
    let project = await Project.findById(projectId)
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
          populate: {
            path: "_id",
            select: ["content"],
            populate: { path: "userId", select: ["username", "avatar"] },
          },
        })
        .then((user) => {
          return handleSuccessResponse(res, 200, user.friendChat, "Thành công");
        });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, error);
  }
};
module.exports.removeChat = async (req, res) => { };
