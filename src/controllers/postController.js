const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Post = require("../model/postModel");
const User = require("../model/userModel");
const Project = require("../model/projectModel");
const Comment = require("../model/commentModel");

exports.getListPost = async (projectId) => {
  var listPost = [];
  await Project.findById(projectId)
    .populate({
      path: "posts",
      populate: [
        {
          path: "comments",
          select: ["authorId", "content"],
          populate: [{ path: "authorId", select: ["username", "avatar"] }],
        },
        { path: "authorId", select: ["username", "avatar"] },
      ],
    })
    .then((project) => {
      listPost = project.posts;
    });
  return listPost;
};
module.exports.addPost = async (req, res) => {
  let body = req.body;
  let authorId = await getCurrentId(req);
  body.authorId = authorId;
  let { projectId } = req.body;
  try {
    let user = await User.findById(authorId);
    if (user) {
      var post = new Post(body);
      await post.save();
      await Project.findById(projectId)
        .populate({
          path: "posts",
          populate: { path: "authorId", select: ["username", "avatar"] },
        })
        .then(async (project) => {
          project.posts.push(post);
          await project.save();
          this.getListPost(projectId).then((listPost) => {
            return handleSuccessResponse(res, 200, listPost, "Thành công");
          });
        });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Thất bai!");
  }
};
module.exports.deletePost = async (req, res) => {
  let { postId } = req.body;
  if (postId) {
    let post = await Post.findByIdAndRemove(postId);
    if (!post) return handleErrorResponse(res, 400, "Không tồn tại postID");
    await Project.findById(post.projectId)
      .populate({
        path: "posts",
        populate: { path: "authorId", select: ["username", "avatar"] },
      })
      .then(async (project) => {
        project.posts.push(post);
        project.posts.splice(project.posts.indexOf(post._id), 1);
        await project.save();
        return handleSuccessResponse(res, 200, project.posts, "Xóa thành công");
      });
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
  await Project.findById(post.projectId)
    .populate("posts")
    .then(async (project) => {
      return handleSuccessResponse(
        res,
        200,
        project.posts,
        "Cập nhật thành công"
      );
    });
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
  } else return handleErrorResponse(res, 400, "Không tồn tại postID");
};
module.exports.getPosts = async (req, res) => {
  let { projectId } = req.query;
  try {
    this.getListPost(projectId).then((listPost) => {
      return handleSuccessResponse(res, 200, listPost, "Thành công");
    });
  } catch (error) {
    return handleErrorResponse(res, 401, error);
  }
};
