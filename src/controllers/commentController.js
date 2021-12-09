const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Blog = require("../model/blogModel");
const Comment = require("../model/commentModel");
const Post = require("../model/postModel");
const Project = require("../model/projectModel");
const User = require("../model/userModel");
const { getListPost } = require("./postController");
// const getListComment = async (postId) => {
//   var listComment = [];
//   await Post.findById(postId)
//     .populate({
//       path: "comments",
//       populate: { path: "authorId", select: ["username", "avatar"] },
//     })
//     .then((post) => {
//       listComment = post.comments;
//     });
//   return listComment;
// };
module.exports.addComment = async (req, res) => {
  let body = req.body;
  let authorId = await getCurrentId(req);
  let { postId, blogId } = req.body;
  body.authorId = authorId;
  try {
    let user = await User.findById(authorId);
    if (user) {
      try {
        let post = await Post.findById(postId);
        let blog = await Blog.findById(blogId);
        let project = await Project.findById(post.projectId);
        if (project.users.indexOf(authorId) === -1) {
          return handleErrorResponse(
            res,
            400,
            "Bạn không có quyền comment trong bài đăng!"
          );
        }
        var comment = new Comment(body);
        comment.save(async function (err, obj) {
          if (err) {
            return handleErrorResponse(res, 400, null, "Add thất bại!");
          }
          if (post) {
            await Post.findById(postId)
              .populate({
                path: "comments",
                populate: { path: "authorId", select: ["username", "avatar"] },
              })
              .then(async (post) => {
                post.comments.push(comment);
                await post.save();
                getListPost(project._id).then((listPost) => {
                  return handleSuccessResponse(
                    res,
                    200,
                    listPost,
                    "Thành công"
                  );
                });
              });
          }
          if (blog) {
          }
        });
      } catch (error) {
        return handleErrorResponse(res, 401, "Không tìm thấy Post!");
      }
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.deleteComment = async (req, res) => {};
module.exports.updateComment = async (req, res) => {};
