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
 * add user to project
 * @param {* projectId, userId} req
 * @param {*} res
 * @returns
 */
module.exports.joinProject = async (req, res) => {
  // req: {projectId, userId (người được mời)}
  let { userId, projectId } = req.body;
  try {
    let project = await Project.findById(projectId);
    let user = await User.findById(userId);
    if (project.users.indexOf(userId) !== -1) {
      // thuộc mảng users
      return handleErrorResponse(res, 400, "User đã thuộc project từ trước!");
    } else {
      project.users.push(user._id);
      await project.save();
      user.projects.push(project._id);
      await user.save();
      return handleSuccessResponse(
        res,
        200,
        { project: project },
        "Join project thành công!"
      );
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
  if (project) {
    if (project.userAdmin.indexOf(userId) !== -1) {
      if (project.users.indexOf(memberId) !== -1) {
        if (project.userAdmin.indexOf(memberId) === -1) {
          project.userAdmin.push(memberId);
          project.save(async (err, obj) => {
            if (err) {
              return handleErrorResponse(
                res,
                400,
                "Một lỗi không mong muốn đã xảy ra"
              );
            }
            let projectSave = await Project.findById(projectId).populate([
              {
                path: "users",
                select: "username avatar role email",
              },
              {
                path: "userAdmin",
                select: "_id",
              },
            ]);
            return handleSuccessResponse(
              res,
              200,
              { users: projectSave.users, userAdmin: project.userAdmin },
              "Thành công"
            );
          });
        } else {
          return handleErrorResponse(res, 400, "Người dùng đã admin từ trước!");
        }
      } else {
        return handleErrorResponse(
          res,
          400,
          "Member chưa là thành viên project!"
        );
      }
    } else {
      return handleErrorResponse(res, 400, "Bạn không có quyền này!");
    }
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại Project");
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
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if (project) {
    if (project.userAdmin[0] !== userId) {
      if (project.userAdmin.indexOf(memberId) !== -1) {
        if (memberId === userId.toString()) {
          return handleErrorResponse(
            res,
            400,
            "Không thể xóa quyền Admin người tạo project"
          );
        }
        project.userAdmin.splice(project.userAdmin.indexOf(memberId), 1);
        project.save(async (err, obj) => {
          if (err) {
            return handleErrorResponse(
              res,
              400,
              "Một lỗi không mong muốn đã xảy ra"
            );
          }
          let projectSave = await Project.findById(projectId).populate([
            {
              path: "users",
              select: "username avatar role email",
            },
            {
              path: "userAdmin",
              select: "_id",
            },
          ]);
          return handleSuccessResponse(
            res,
            200,
            { users: projectSave.users, userAdmin: project.userAdmin },
            "Thành công"
          );
        });
      } else {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
    } else {
      return handleErrorResponse(res, 400, "Bạn không có quyền này!");
    }
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại Project");
  }
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
    if (project) {
      if (memberId === project.userAdmin[0])
        return handleErrorResponse(
          res,
          400,
          "Không thể xóa người tạo ra khỏi Project"
        );
      if (project.userAdmin.indexOf(userId) !== -1) {
        if (project.users.indexOf(memberId) !== -1) {
          project.users.splice(project.users.indexOf(memberId), 1);
          project.save(async (err, obj) => {
            if (err) {
              return handleErrorResponse(
                res,
                400,
                "Một lỗi không mong muốn đã xảy ra"
              );
            }
            let projectSave = await Project.findById(projectId).populate([
              {
                path: "users",
                select: "username avatar role email",
              },
              {
                path: "userAdmin",
                select: "_id",
              },
            ]);
            return handleSuccessResponse(
              res,
              200,
              { users: projectSave.users, userAdmin: project.userAdmin },
              "Thành công"
            );
          });
        } else {
          return handleErrorResponse(
            res,
            400,
            "Nguời dùng không thuộc project"
          );
        }
      }
      return handleErrorResponse(res, 400, "Không có quyền admin");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, error + "");
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
