const jwt = require("jsonwebtoken");
const {
  handleErrorResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
const Project = require("../model/projectModel");
const Post = require("../model/postModel");
module.exports = async (req, res, next) => {
  let userId = await getCurrentId(req);
  let { postId } = req.body;
  if (postId !== undefined) {
    let post = await Post.findById(postId);
    let project = await Project.findById(post.projectId);
    if (project) {
      if (project.users.indexOf(userId) !== -1) {
        next();
      } else {
        return handleErrorResponse(res, 400, "ErrorSecurity");
      }
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại projectId");
    }
  } else {
    let projectId = req.body.projectId
      ? req.body.projectId
      : req.query.projectId;
    if (projectId != undefined) {
      let project = await Project.findById(projectId);
      if (project) {
        if (project.users.indexOf(userId) !== -1) {
          next();
        } else {
          return handleErrorResponse(res, 400, "ErrorSecurity");
        }
      } else {
        return handleErrorResponse(res, 400, "Không tồn tại projectId");
      }
    } else {
      return handleErrorResponse(res, 400, "ErrorPostMiddlerware");
    }
  }
};
