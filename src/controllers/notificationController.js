const {
  getCurrentId,
  handleErrorResponse,
  handleSuccessResponse,
} = require("../helper/responseHelper");
const Notification = require("../model/notificationModel");
const Project = require("../model/projectModel");
const User = require("../model/userModel");
const io = require("socket.io-client");
const socket = io.connect("http://localhost:3002/project", { reconnect: true });
/**
 *
 * @param {*} data userId: string, projectId: string, content?: string, authorId: string, taskId?: string, type: string
 * @param {*} callback () => void
 */
exports.addNotificationOneUser = async (data, callback) => {
  try {
    let noti = new Notification({
      content: data.content || "",
      userId: data.userId,
      authorId: data.authorId,
      projectId: data.projectId || null,
      taskId: data.taskId || null,
      type: data.type,
    });
    noti.save(async (err, obj) => {
      if (err) {
        callback("Một lỗi không mong muốn đã xảy ra");
        return;
      }
      let userNoti = await User.findById(data.userId);
      userNoti.notifications.push(noti._id);
      userNoti.save((err, obj) => {
        if (err) {
          checkError = true;
          return;
        }
        socket.emit("newNotification", {
          userId: data.userId,
          projectId: data.projectId,
          authorId: data.authorId,
          type: data.type,
        });
        callback(null);
      });
    });
  } catch (err) {
    callback("Một lỗi không mong muốn đã xảy ra");
  }
};

// /**
//  *
//  * @param {*} data userId: string, projectId: string, content: string, toUserId: Array(string),
//  * @param {*} callback (err) => void
//  */
// exports.addNotification = async (data, callback) => {
//   try {
//     let project = await Project.findById(data.projectId);
//     if (!project) {
//       callback("Không tồn tại project");
//       return;
//     }
//     let checkError = false;
//     await Project.findById(projectId)
//       .populate("users")
//       .then((project) => {
//         project.users.forEach((user, index) => {
//           if (data.toUserId.includes(user._id.toString())) {
//             let noti = new Notification({
//               content: content,
//               authorId: userId,
//             });
//             noti.save(async (err, obj) => {
//               if (err) {
//                 checkError = true;
//                 return;
//               }
//               socket.emit("newNotification", {
//                 userId: data.userId,
//                 message: data.content,
//                 projectId: data.projectId,
//                 authorId: data.authorId,
//               });
//               let userNoti = await User.findById(user._id);
//               userNoti.notifications.push(noti._id);
//               userNoti.save((err, obj) => {
//                 if (err) {
//                   checkError = true;
//                   return;
//                 }
//               });
//             });
//           }
//         });
//         if (checkError) {
//           callback("Một lỗi không mong muốn đã xảy ra");
//         } else {
//           callback(null);
//         }
//       });
//   } catch (error) {
//     callback("Một lỗi không mong muốn đã xảy ra");
//   }
// };
// /**
//  * Create notifition
//  * @param { * projectId, content: string, toUserId: Array(string)} req
//  * @param {*} res
//  * @returns
//  */
// module.exports.sendNotifications = async (req, res) => {
//   let userId = await getCurrentId(req);
//   let { projectId, content, toUserId } = req.body;
//   try {
//     let user = await User.findById(userId);
//     if (!user) {
//       return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
//     }
//     this.addNotification(
//       {
//         userId: userId,
//         sendUsers: toUserId,
//         projectId: projectId,
//         content: content,
//         toUserId: toUserId,
//       },
//       (err) => {
//         if (err) {
//           return handleErrorResponse(
//             res,
//             400,
//             "Một lỗi không mong muốn đã xảy ra"
//           );
//         } else {
//           return handleSuccessResponse(res, 200, {}, "Thành công");
//         }
//       }
//     );
//   } catch (err) {
//     console.log(err);
//     return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
//   }
// };
/**
 * get all notifications of one user
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getNotifications = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId).populate({
      path: "notifications",
      populate: [
        {
          path: "authorId",
          select: "_id avatar role email username",
        },
        {
          path: "projectId",
          select: "_id name",
        },
        {
          path: "taskId",
          select: "_id name",
        },
      ],
    });
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
    let noti = await Notification.findById(notificationId);
    if (!noti) {
      return handleErrorResponse(res, 400, "Thông báo không còn tồn tại");
    }
    user = await User.findById(userId);
    if (user.notifications.includes(notificationId)) {
      await Notification.findByIdAndRemove(notificationId);
      user.notifications.splice(user.notifications.indexOf(notificationId), 1);
      user.save();
      return this.getNotifications(req, res);
    } else {
      return handleErrorResponse(res, 400, "Bạn không có quyền xóa thông báo");
    }
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
