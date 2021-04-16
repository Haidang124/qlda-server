const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../../helper/responseHelper");
const Post = require("../../model/postModel");
const User = require("../../model/userModel");
const Project = require("../../model/projectModel");

module.exports.addPost = async (req, res) => {
  let body = req.body;
  let { authorId, projectId } = req.body;
  try {
    let user = await User.findById(authorId);
    if (user) {
      let project = await Project.findById(projectId);
      if (project) {
        var post = new Post(body);

        post.save(function (err, obj) {
          if (err) return handleErrorResponse(res, 400, null, "Add thất bại!");

          return handleSuccessResponse(
            res,
            200,
            { post: post },
            "Add thành công!"
          );
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Thất bai!");
  }
};
module.exports.deletePost = async (req, res) => {
  let { postId } = req.body;
  if (postId) {
    let post = await Post.findOneAndRemove({ _id: postId });
    if (!post) return handleErrorResponse(res, 400, "Không tồn tại postID");
    return handleSuccessResponse(res, 200, null, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại postID");
  }
};
module.exports.updatePost = async (req, res) => {
  let { postId, content } = req.body;

  let post = await Post.findOneAndUpdate(
    { _id: postId },
    { content: content },
    { new: true }
  );
  if (!post) return handleErrorResponse(res, 400, "Không tồn tại postId");
  return handleSuccessResponse(res, 200, null, "Cập nhật thành công");
};
module.exports.getComments = async (req, res) => {
  let { postId } = req.body;
  let post = await Post.findById(postId);
  if (post) {
    let commentList = await Post.find({ postId: postId });
    return handleSuccessResponse(
      res,
      200,
      { commentList: commentList },
      "Lấy comments thành công!"
    );
  }
};
