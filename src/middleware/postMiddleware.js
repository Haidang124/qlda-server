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
  let {postId} = req.body;
  if(postId != undefined) {
    let projectId = await (await Post.findById(postId)).get("projectId");
    let project = await Project.findById(projectId);
    if (project) {
        if (project.userId.toString() === userId || project.userJoin.indexOf(userId) != -1) {
            next();
        }
        else {
            return handleErrorResponse(
                res,
                400,
                "ErrorSecurity"
            )
        }
    }
    else {
        return handleErrorResponse(
        res,
        400,
        "Không tồn tại projectId"
        )
    }
  }
  else {
    let {projectId} = req.body;
    if(projectId != undefined) {
        let project = await Project.findById(projectId);
        if (project) {
            if (project.userId.toString() === userId || project.userJoin.indexOf(userId) != -1) {
                next();
            }
            else {
                return handleErrorResponse(
                    res,
                    400,
                    "ErrorSecurity"
                )
            }
        }
        else {
            return handleErrorResponse(
            res,
            400,
            "Không tồn tại projectId"
            )
        }
    } else {
        return handleErrorResponse(
            res,
            400,
            "ErrorPostMiddlerware"
        )
    }
  }
};
