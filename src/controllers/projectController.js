const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Project = require("../model/projectModel");
const Post = require("../model/postModel");
const User = require("../model/userModel");
const Comment = require("../model/commentModel");
const sectionController = require("./sectionController");
const labelController = require("./labelController");
const { RoleProject } = require("../helper/role");
const { ObjectId } = require("mongoose");
const Notification = require("../model/notificationModel");
const notificationController = require("../controllers/notificationController");
/**
 * get Role user
 * @param {*} res
 * @param {*} userId
 * @param {*} projectId
 * @returns
 */
exports.getRole = async (res, userId, projectId) => {
  let project = await Project.findById(projectId);
  if (!project) {
    return handleErrorResponse(res, 400, "Không tồn tại project");
  }
  let role = [];
  if (project.userAdmin.indexOf(userId) !== -1) {
    role.push(RoleProject.Admin);
  }
  if (project.users.indexOf(userId) !== -1) {
    role.push(RoleProject.User);
  }
  return role;
};

/**
 * Check user is Admin project
 * @param {*} res
 * @param {*} userId
 * @param {*} projectId
 * @returns
 */
exports.checkAdmin = async (res, userId, projectId) => {
  let project = await Project.findById(projectId);
  if (!project) {
    return handleErrorResponse(res, 400, "Không tồn tại project");
  }
  if (project.userAdmin.indexOf(userId) !== -1) {
    return true;
  }
  return false;
};
/**
 * set default section when add task
 * @param {*} userId
 * @param {*} projectId
 */
const addSectionDefault = async (userId, projectId) => {
  await sectionController.addNewSection(
    {
      authorId: userId,
      projectId: projectId,
      name: "Planning",
    },
    async (err, allTasks) => {
      await sectionController.addNewSection(
        {
          authorId: userId,
          projectId: projectId,
          name: "To do",
        },
        async (err, allTasks) => {
          await sectionController.addNewSection(
            {
              authorId: userId,
              projectId: projectId,
              name: "Completed",
            },
            async (err, allTasks) => {}
          );
        }
      );
    }
  );
};

/**
 *
 * @param {*} userId  string
 * @param {*} projectId string
 */
const addDefaultLabel = async (userId, projectId) => {
  labelController.addLabelOne(
    projectId,
    "bug",
    "#bf1a07",
    "Something isn't working",
    userId,
    (err, label) => {
      labelController.addLabelOne(
        projectId,
        "duplicate",
        "#cfd3d7",
        "This issue or pull request already exists",
        userId,
        (err, label) => {}
      );
    }
  );
};
/**
 * get all labels in project
 * @param {*} req projectId
 * @param {*} res
 * @returns
 */
module.exports.getLabels = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.query;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
    let project = await Project.findById(projectId).populate({
      path: "labels",
    });
    return handleSuccessResponse(res, 200, project.labels, "Thành công");
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * add project
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.addProject = async (req, res) => {
  // var io = req.app.get("io");
  let body = req.body;
  let userId = await getCurrentId(req);
  body.userAdmin = [userId];
  body.users = [userId];
  try {
    let user = await User.findById(userId);
    if (user) {
      var project = new Project(body);
      project.save(async function (err, obj) {
        if (err) {
          return handleErrorResponse(res, 400, null, "Add project thất bại!");
        }
        user.projects.push(project._id);
        await addSectionDefault(userId, project._id);
        await addDefaultLabel(userId, project._id);
        await user.save();
        return handleSuccessResponse(
          res,
          200,
          { project: project },
          "Add project thành công!"
        );
      });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
/**
 *
 * @param {*} req {projectId: string; emailInvite: string; }
 * @param {*} res
 * @returns
 */
module.exports.inviteJoinProject = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId, emailInvite } = req.body;
  try {
    let user = await User.findById(userId);
    let project = await Project.findById(projectId);
    if (project.users.includes(userId)) {
      let userInvite = await User.findOne({ email: emailInvite });
      if (userInvite) {
        if (project.users.includes(userInvite._id)) {
          return handleErrorResponse(
            res,
            400,
            "Thành viên đã tham gia project"
          );
        }
        let notiCheck = await Notification.findOne({
          userId: userInvite._id,
          type: "project-invite",
          projectId: projectId,
        });
        if (notiCheck) {
          return handleErrorResponse(
            res,
            400,
            "Đã gửi lời mời cho thành viên, hãy chờ thêm."
          );
        } else {
          notificationController.addNotificationOneUser(
            {
              userId: userInvite._id,
              projectId: projectId,
              type: "project-invite",
              authorId: userId,
            },
            (err) => {
              if (err) {
                return handleErrorResponse(res, 400, err);
              } else {
                return handleSuccessResponse(res, 200, "Đã gửi lời mời");
              }
            }
          );
        }
      } else {
        return handleErrorResponse(res, 400, "Không tồn tại người dùng");
      }
    } else {
      return handleErrorResponse(
        res,
        400,
        "Bạn không có quyền thêm thành viên"
      );
    }
  } catch (err) {
    console.log(err);
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * add user to project
 * @param {*} req notificationId: string, status: boolean
 * @param {*} res
 * @returns
 */
module.exports.joinProject = async (req, res) => {
  let { notificationId, status, projectId } = req.body;
  let userId = await getCurrentId(req);
  try {
    let notification = await Notification.findById(notificationId);
    if (notification.type !== "project-invite") {
      return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
    }
    if (notification.userId.toString() === userId) {
      if (status) {
        let project = await Project.findById(notification.projectId);
        let userInvite = await User.findById(userId);
        project.users.push(userId);
        userInvite.projects.push(project._id);
        project.save();
        userInvite.save();
      }
      notificationController.addNotificationOneUser(
        {
          userId: notification.authorId,
          projectId: notification.projectId,
          type: status ? "project-agree" : "project-refuse",
          authorId: userId,
        },
        () => {
          notification.type = status
            ? "project-agree-invited"
            : "project-refuse-invited";
          notification.save((err, obj) => {
            return notificationController.getNotifications(req, res);
          });
        }
      );
    } else {
      return handleErrorResponse(res, 400, "Không có quyền truy cập");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Join project thất bại!");
  }
};
/**
 * get all users in project
 * @param {*} req projectId
 * @param {*} res
 */

module.exports.getUsers = async (req, res) => {
  let { projectId } = req.query;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
    let project = await Project.findById(projectId).populate([
      {
        path: "users",
        select: "avatar username role email _id",
      },
      {
        path: "userAdmin",
        select: "_id",
      },
    ]);
    return handleSuccessResponse(
      res,
      200,
      { users: project.users, userAdmin: project.userAdmin },
      "Thành công"
    );
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * delete project
 * @param {*} req
 * @param {*} res
 * @returns
 */

module.exports.deleteProject = async (req, res) => {
  let { projectId } = req.body;
  let userId = await getCurrentId(req);
  if (projectId) {
    let project = await Project.findById(projectId);
    let user = await User.findById(userId);
    if (!project)
      return handleErrorResponse(res, 400, "Không tồn tại projectID");
    if (project.userAdmin.indexOf(userId) === -1) {
      // không thuộc list admin project
      return handleErrorResponse(res, 400, "Bạn không có quyền xóa Project");
    }
    // xóa project list của mỗi user
    project.users.forEach(async (id) => {
      let user = await User.findById(id);
      user.projects.splice(user.projects.indexOf(projectId), 1);
      user.save();
    });
    await Project.deleteOne({ _id: projectId });
    return handleSuccessResponse(res, 200, project, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại projectID");
  }
};

module.exports.getProject = async (req, res) => {
  //full my project
  try {
    let userId = await getCurrentId(req);
    await User.findById(userId)
      .populate("projects")
      .then((result) => {
        return handleSuccessResponse(res, 200, result.projects, "Thành công");
      })
      .catch((err) => {
        return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu!");
      });
  } catch (error) {
    return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu!");
  }
};
module.exports.getAllProject = async (req, res) => {
  try {
    let listProject = await Project.find({});
    return handleSuccessResponse(res, 200, listProject, "Thành công");
  } catch (error) {
    return handleErrorResponse(res, 400, "Không thể lấy dữ liệu");
  }
};
module.exports.getProjectById = async (req, res) => {
  let { projectId } = req.body;
  try {
    await Project.findOne({ _id: projectId })
      .populate("users")
      .then((result) => {
        return handleSuccessResponse(res, 200, result, "Thành công");
      });
  } catch (error) {
    return handleErrorResponse(res, 400, "Không tồn tại project");
  }
};
// module.exports.getProjectJoined = async (req, res) => {
//   let userId = await getCurrentId(req);
//   try {
//     let listProjectIdJoin = await (
//       await User.findOne({ _id: userId })
//     ).get("projectJoin");
//     let listProjectJoin = [];
//     for (var i = 0; i < listProjectIdJoin.length; i++) {
//       listProjectJoin.push(
//         await Project.findOne({ _id: listProjectIdJoin[i] })
//       );
//     }
//     return handleSuccessResponse(
//       res,
//       200,
//       { projectJoined: listProjectJoin },
//       "Thành công"
//     );
//   } catch (error) {
//     return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu");
//   }
// };
module.exports.getChatProject = async (req, res) => {
  let { projectId } = req.body;
  let project = await Project.findById(projectId);
  if (project) {
    return handleSuccessResponse(
      res,
      200,
      { listChat: project.chat },
      "Lấy comments thành công!"
    );
  } else return handleErrorResponse(res, 400, "Không tồn tại projectId");
};
module.exports.getUserJoin = async (req, res) => {
  let { projectId } = req.body;
  await Project.findById(projectId)
    .populate("users")
    .then((result) => {
      return handleSuccessResponse(res, 200, result, "Thành công");
    })
    .catch((err) => {
      return handleErrorResponse(res, 400, "Thất bại");
    });
  // if (project) {
  //   let listUser = project.users;
  //   listUser.push(project.userId);
  //   let listProfile = [];
  //   return handleSuccessResponse(
  //     res,
  //     200,
  //     { listUser: listProfile },
  //     "Thành công"
  //   );
  // }
  // return handleErrorResponse(res, 400, "Thất bại");
};
/**
 * setAdmin for a member
 * @param {*} req projectId, memberId
 * @param {*} res
 * @returns
 */
module.exports.setAdmin = async (req, res) => {
  let { projectId, memberId } = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  let user = await User.findById(userId);
  let member = await User.findById(memberId);
  if (project && user && member) {
    if (project.userAdmin.includes(userId)) {
      // admin
      if (project.users.includes(memberId)) {
        // member thuộc project
        if (project.userAdmin.includes(memberId)) {
          // member đã là admin
          return handleErrorResponse(res, 400, "Thành viên đã là Admin");
        } else {
          project.userAdmin.push(memberId);
          project.save((err, obj) => {
            if (err) {
              return handleErrorResponse(
                res,
                400,
                "Một lỗi không mong muốn đã xảy ra"
              );
            }
            return this.getUserIdAndUserAdminId(req, res);
          });
        }
      } else {
        // member không thuộc project
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
    } else {
      // Không có quyền admin
      return handleErrorResponse(res, 400, "Không có quyền truy cập");
    }
  } else {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * drop admin to project
 * @param {*} req projectId, memberId
 * @param {*} res
 * @returns
 */
module.exports.dropAdmin = async (req, res) => {
  let { projectId, memberId } = req.body;
  try {
    let userId = await getCurrentId(req);
    let project = await Project.findById(projectId);
    let user = await User.findById(userId);
    let member = await User.findById(memberId);
    if (project && user && member) {
      if (project.userAdmin.includes(userId)) {
        if (memberId === project.userAdmin[0].toString()) {
          // xóa quyền Admin người tạo
          return handleErrorResponse(
            res,
            400,
            "Không thể xóa người tạo project"
          );
        } else {
          if (project.userAdmin.includes(memberId)) {
            // member thuộc admin
            project.userAdmin.splice(project.userAdmin.indexOf(memberId), 1);
            project.save((err, obj) => {
              if (err) {
                return handleErrorResponse(
                  res,
                  400,
                  "Một lỗi không mong muốn đã xảy ra"
                );
              }
              return this.getUserIdAndUserAdminId(req, res);
            });
          } else {
            return handleErrorResponse(
              res,
              400,
              "Thành viên này không có quyền Admin"
            );
          }
        }
      } else {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
    } else {
      return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 *
 * @param {*} req projectId
 * @param {*} res
 * @returns
 */
exports.getUserIdAndUserAdminId = async (req, res) => {
  let { projectId } = req.body;
  let projectSave = await Project.findById(projectId).populate([
    {
      path: "users",
      select: "username avatar role email",
    },
  ]);
  return handleSuccessResponse(
    res,
    200,
    { users: projectSave.users, userAdmin: projectSave.userAdmin },
    "Thành công"
  );
};
/**
 * delete member
 * @param {*} req  projectId, memberId
 * @param {*} res
 * @returns
 */
module.exports.deleteMember = async (req, res) => {
  let { projectId, memberId } = req.body;
  try {
    let userId = await getCurrentId(req);
    let project = await Project.findById(projectId);
    let user = await User.findById(userId);
    let member = await User.findById(memberId);
    if (project && user && member) {
      if (memberId === project.userAdmin[0].toString())
        return handleErrorResponse(
          res,
          400,
          "Không thể xóa người tạo ra khỏi Project"
        );
      if (project.userAdmin.indexOf(userId) !== -1) {
        // admin
        if (project.users.indexOf(memberId) !== -1) {
          // member thuộc project
          project.users.splice(project.users.indexOf(memberId), 1);
          if (project.userAdmin.includes(memberId)) {
            project.userAdmin.splice(project.userAdmin.indexOf(memberId), 1);
          }
          member.projects.splice(member.projects.indexOf(projectId), 1);
          member.save();
          project.save((err, obj) => {
            if (err) {
              return handleErrorResponse(
                res,
                400,
                "Một lỗi không mong muốn đã xảy ra"
              );
            }
            return this.getUserIdAndUserAdminId(req, res);
          });
        } else {
          return handleErrorResponse(
            res,
            400,
            "Nguời dùng không thuộc project"
          );
        }
      } else {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 * return all project
 * @param {*} req projectId
 * @param {*} res
 */
module.exports.analysis = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.body;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    let selectUser = "_id username email avatar role";
    await Project.findById(projectId)
      .populate([
        {
          path: "users",
          select: selectUser,
        },
        {
          path: "sections",
          populate: [
            {
              path: "tasks",
              populate: [
                {
                  path: "assignment",
                  select: selectUser,
                },
                {
                  path: "authorId",
                  select: selectUser,
                },
              ],
            },
            {
              path: "authorId",
              select: selectUser,
            },
          ],
          select: "_id tasks authorId projectId name",
        },
      ])
      .select("users userAdmin sections name createdAt updatedAt")
      .then((project) => {
        return handleSuccessResponse(res, 200, project, "Thành công");
      });
  } catch (err) {
    console.log(err);
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 * GET all task of user
 * @param {*} req projectId
 * @param {*} res
 */
module.exports.getAllTasks = async function (req, res) {
  let { projectId } = req.query;
  let userId = await getCurrentId(req);
  try {
    let selectUser = "avatar role tasks email _id username";
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    let project = await Project.findById(projectId);
    if (project) {
      if (!project.users.includes(userId)) {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
      project = await Project.findById(projectId).populate({
        path: "users",
        populate: [
          {
            path: "tasks",
            // match: {
            //   sectionId: {
            //     _id: projectId,
            //   },
            // },
            populate: [
              {
                path: "assignment",
                select: selectUser,
              },
              {
                path: "dependenciesTask",
              },
              {
                path: "sectionId",
                populate: [
                  {
                    path: "authorId",
                    select: selectUser,
                  },
                ],
                select: "name authorId projectId",
              },
              {
                path: "labels",
              },
              {
                path: "authorId",
                select: selectUser,
              },
            ],
          },
        ],
        select: selectUser,
      });
      await project.users.forEach(async (user) => {
        let tasks = [];
        await user.tasks.forEach((task) => {
          if (task.sectionId.projectId.toString() === projectId) {
            tasks.push(task);
          }
        });
        user.tasks = [...tasks];
      });
      return handleSuccessResponse(res, 200, project.users, "Thành công");
    } else {
      return handleSuccessResponse(res, 400, "Không tồn tại project");
    }
  } catch (err) {
    console.log(err);
    return handleSuccessResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
