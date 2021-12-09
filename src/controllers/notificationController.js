const {
  getCurrentId,
  handleErrorResponse,
  handleSuccessResponse,
} = require("../helper/responseHelper");
const Notification = require("../model/notificationModel");
const Project = require("../model/projectModel");
const User = require("../model/userModel");

/**
 * Create notifition
 * @param { * projectId, content: string, toUserId: Array(string), type: string, deadline: {from: Date, to: Date}} req
 * @param {*} res
 * @returns
 */
module.exports.sendNotifications = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId, content, toUserId, type, deadline } = req.body;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    await Project.findById(projectId)
      .populate("users")
      .then((project) => {
        project.users.forEach((user, index) => {
          if (user._id.toString() !== userId) {
            let noti = new Notification({
              content: content,
              type: type,
              deadline: deadline || { from: null, to: null },
              authorId: userId,
            });
            noti.save(async (err, obj) => {
              if (err) {
                return handleErrorResponse(
                  res,
                  400,
                  "Một lỗi không mong muốn đã xảy ra"
                );
              }
              let userNoti = await User.findById(user._id);
              userNoti.notifications.push(noti._id);
              userNoti.save((err, obj) => {
                if (err) {
                  return handleErrorResponse(
                    res,
                    400,
                    "Một lỗi không mong muốn đã xảy ra"
                  );
                }
              });
            });
          }
        });
        return handleSuccessResponse(res, 200, project.user, "Thành công");
      });
  } catch (err) {
    console.log(err);
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 * get all notifications of one user
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getNotifications = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId).populate("notifications");
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    return handleSuccessResponse(res, 200, user.notifications, "Thành công");
  } catch (err) {
    return handleSuccessResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * delete notification
 * @param {* notificationId} req
 * @param {*} res
 */
module.exports.deleteNotification = async (req, res) => {
  let { notificationId } = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    let noti = await Notification.findByIdAndRemove(notificationId);
    if (!noti) {
      return handleErrorResponse(res, 400, "Thông báo không còn tồn tại");
    }
    user = await User.findById(userId).populate("notifications");
    return handleSuccessResponse(res, 200, user.notifications, "Thành công");
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
