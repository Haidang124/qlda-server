const {
  handleErrorResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Project = require("../model/projectModel");
module.exports = async (req, res, next) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.body.projectId ? req.body : req.query;
  let project = await Project.findById(projectId);
  if (project) {
    // Kiểm tra xem user có quyền truy cập Project hay không
    if (project.users.indexOf(userId) !== -1) {
      next();
    } else {
      return handleErrorResponse(res, 400, "ErrorSecurity");
    }
  } else {
    return handleErrorResponse(res, 400, "ErrorSecurity");
  }
};
