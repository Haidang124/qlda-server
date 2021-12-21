const Blog = require("../model/blogModel");
const Project = require("../model/projectModel");
const {
    handleErrorResponse,
    handleSuccessResponse,
    getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
module.exports.addBlog = async (req, res) => {
    let { title, content, describe, security, projectId } = req.body
    let userId = await getCurrentId(req);
    let user = await User.findById(userId);
    var blog = new Blog({
        authorId: userId,
        title: title,
        describe: describe,
        content: content,
        security: security ? security : 'Pulic'
    });
    if (security === 'Private') {
        let project = await Project.findById(projectId);
        project.training.push({ type: 'blog', blogId: blog })
        await project.save();
    }
    blog.save(async function (err, obj) {
        if (err) {
            return handleErrorResponse(res, 400, null, "Thất bại");
        }
        user.blogs.push(blog)
        return handleSuccessResponse(res, 200, blog, "Thành công");
    });
};
module.exports.getBlog = async (req, res) => {
    let userId = await getCurrentId(req);
    let user = await User.findById(userId);
    let { numberBlog, blogId } = req.body
    if (blogId) {
        await Blog.findById(blogId).populate({
            path: "authorId",
            populate: { path: "userId", select: ["username", "avatar"] },
        }).then((blog) => {
            return handleSuccessResponse(res, 200, blog, "Thành công");
        });
    } else {
        await Blog.find({}).limit(numberBlog ? numberBlog : 5).populate({
            path: "authorId",
            populate: { path: "userId", select: ["username", "avatar"] },
        }).then((blog) => {
            return handleSuccessResponse(res, 200, blog, "Thành công");
        });
    }
};
module.exports.getBlogUser = async (req, res) => {
    let { userId, numberBlog } = req.body
    let blog = await Blog.find({ authorId: userId }).limit(numberBlog ? numberBlog : 5)
    return handleSuccessResponse(res, 200, blog, "Thành công");
};
module.exports.updateBlog = async (req, res) => {
    let { title, content, describe, blogId } = req.body
    let post = await Post.findOneAndUpdate(
        { _id: blogId },
        { content: content },
        { title: title },
        { describe: describe }
    );
    blog.save(async function (err, obj) {
        if (err) {
            return handleErrorResponse(res, 400, null, "Thất bại");
        }
        return handleSuccessResponse(res, 200, {}, "Thành công");
    });
};
module.exports.removeBlog = async (req, res) => {
    let { blogId } = req.querry
    let blog = await Blog.findByIdAndRemove(blogId);
    if (!blog) {
        return handleErrorResponse(res, 400, "Không tồn tại blog");
    }
    let userId = await getCurrentId(req);
    let user = await User.findById(userId);
    user.blogs.splice(user.blogs.indexOf(blogId), 1);
    user.save();
    return handleSuccessResponse(res, 200, {}, "Thành công");
};
