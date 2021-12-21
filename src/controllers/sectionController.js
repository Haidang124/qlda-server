const { __esModule } = require("validator/lib/isAlpha");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Project = require("../model/projectModel");
const Section = require("../model/sectionModel");
const User = require("../model/userModel");
const taskController = require("../controllers/taskController");

/**
 *
 * @param {*} params
 * @param {*} callback (err, obj, allTasks)
 */
exports.addNewSection = async (params, callback) => {
  // {authorId, projectId, name}
  let project = await Project.findById(params.projectId);
  if (project) {
    let section = new Section({
      authorId: params.authorId,
      projectId: params.projectId,
      name: params.name,
      tasks: [],
    });
    section.save(async function (err, obj) {
      if (err) {
        callback("Một lỗi không mong muốn đã xảy ra", null);
        return;
      }
      project.sections.push(section._id);
      await project.save(async (err, obj) => {
        if (err) {
          callback("Một lỗi không mong muốn đã xảy ra", null);
        }
        taskController.getAllTasks(params.projectId, (err, allTasks) => {
          if (err) {
            callback(err, null);
            return;
          }
          callback(null, allTasks);
        });
      });
    });
  } else {
    throw Error("Không tồn tại project");
  }
};

module.exports.addSection = async (req, res) => {
  let { projectId } = req.body;
  let body = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    let project = await Project.findById(projectId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    if (!project) {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
    if (project.users.indexOf(userId) !== -1) {
      if (project.userAdmin.indexOf(userId) !== -1) {
        this.addNewSection(
          {
            authorId: userId,
            projectId: projectId,
            name: body.name,
          },
          async (err, allTasks) => {
            if (err) {
              return handleErrorResponse(
                res,
                400,
                null,
                "Add section thất bại!"
              );
            }
            return handleSuccessResponse(
              res,
              200,
              allTasks,
              "Add section thành công!"
            );
          }
        );
      } else {
        return handleErrorResponse(res, 400, "Không có quyền thêm section");
      }
    } else {
      return handleErrorResponse(
        res,
        400,
        "User không là thành viên của project"
      );
    }
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
module.exports.getSections = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.query;
  try {
    let user = await User.findById(userId);
    let project = await Project.findById(projectId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    if (!project) {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
    await Project.findById(projectId)
      .populate("sections")
      .then((result) => {
        return handleSuccessResponse(res, 200, result.sections, "Thành công");
      });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

exports.updateName = async (params, callback) => {
  // params: {sectionId, name}
  let section = await Section.findById(params.sectionId);
  if (section) {
    section.name = params.name;
    section.save(async function (err, obj) {
      if (err) {
        callback("Một lỗi không mong muốn đã xảy ra", null);
        return;
      }
      taskController.getAllTasks(params.projectId, (err, allTasks) => {
        callback(err, allTasks);
      });
    });
  } else throw Error("Không tồn tại section");
};

module.exports.updateNameSection = async (req, res) => {
  // req: {projetcId, sectionId, name}
  let userId = await getCurrentId(req);
  let { projectId } = req.body;
  try {
    let user = User.findById(userId);
    let project = await Project.findById(projectId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    if (!project) {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
    if (project.userAdmin.indexOf(userId) !== -1) {
      this.updateName(
        {
          projectId: req.body.projectId,
          sectionId: req.body.sectionId,
          name: req.body.name,
        },
        async (err, allTasks) => {
          if (err) {
            return handleErrorResponse(
              res,
              400,
              "Một lỗi không mong muốn đã xảy ra"
            );
          }
          return handleSuccessResponse(res, 200, allTasks, "Thành công");
        }
      );
    } else {
      return handleErrorResponse(res, 400, "Không có quyền chỉnh sửa");
    }
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

module.exports.deleteSection = async (req, res) => {
  // req: {projetcId, sectionId}
  let userId = await getCurrentId(req);
  let { projectId } = req.body;
  try {
    let user = User.findById(userId);
    let project = await Project.findById(projectId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    if (!project) {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
    if (project.userAdmin.indexOf(userId) !== -1) {
      let query = await Section.findByIdAndRemove(req.body.sectionId);
      if (query) {
        project.sections.splice(
          project.sections.indexOf(req.body.sectionId, 1)
        );
        project.save((err, object) => {
          query.tasks.forEach((taskId, i) => {
            taskController.deleteTaskById(
              { taskId: taskId },
              false,
              (err, obj, section) => {
                if (err) {
                  return handleErrorResponse(
                    "Một lỗi không mong muốn đã xảy ra"
                  );
                }
              }
            );
          });
          taskController.getAllTasks(projectId, (err, allTasks) => {
            if (err) return handleErrorResponse(res, 400, err);
            return handleSuccessResponse(res, 200, allTasks, "Thành công");
          });
        });
      } else {
        return handleErrorResponse(res, 400, "Không thể xóa section");
      }
    } else {
      return handleErrorResponse(res, 400, "Không có quyền chỉnh sửa");
    }
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
