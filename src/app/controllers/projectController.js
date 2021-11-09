const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../../helper/responseHelper");
const Project = require("../../model/projectModel");
const Post = require("../../model/postModel");
const User = require("../../model/userModel");
const Comment = require("../../model/commentModel");
const Task = require("../../model/taskModel");
const { use } = require("../../routers/usersRouter");
const { getNameAndAvatar } = require("./userController");

module.exports.addProject = async (req, res) => {
  // var io = req.app.get("io");
  let body = req.body;
  let userId = await getCurrentId(req);
  body.admin = [userId];
  body.userId = userId;
  try {
    let user = await User.findById(userId);
    if (user) {
      var project = new Project(body);
      project.save(async function (err, obj) {
        if (err)
          return handleErrorResponse(res, 400, null, "Add project thất bại!");
        var createdProject = await User.createProject(userId, project._id);
        if (createdProject) {
          return handleSuccessResponse(
            res,
            200,
            { project: project },
            "Add project thành công!"
          );
        }
      });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.joinProject = async function (userId, projectId) {
  try {
    let project = await Project.findById(projectId);
    if(userId === project.userId.toString()  || project.userJoin.indexOf(userId) != -1) {
      return handleErrorResponse(res, 400, "MemberInProject");
    }
    let query1 = await Project.userJoin(userId, projectId);
    let query2 = await User.joinProject(userId, projectId);
  } catch (error) {
    return handleErrorResponse(res, 400, "ErrorJoinProject");
  }
};
exports.getListPosts = async (projectId) => {  
  let project = await Project.findById(projectId);
  if (project) {
    var postList = await Post.find({ projectId: projectId });
    let newData = [];
    for (let i = 0; i < postList.length; i++) {
      commentList = await Comment.find({ postId: postList[i]._id });
      for (let j = 0; j < commentList.length; j++) {
        let author = await getNameAndAvatar(commentList[j].authorId);
        commentList[j] = commentList[j].toObject();
        commentList[j].author = author;
      }
      let author = await getNameAndAvatar(postList[i].authorId);
      let tmp = postList[i].toObject();
      tmp.comments = commentList;
      tmp.author = author;
      tmp.date = tmp.createdAt.toString().substring(4, 15);
      newData.push(tmp);
    }
    return newData;
  }
};
module.exports.getPosts = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.body;
  try {
    let project = await Project.findById(projectId);
    if (project) {
      // Kiểm tra xem user có quyền truy cập Project hay không
      let newData = await this.getListPosts(projectId);
      return handleSuccessResponse(
        res,
        200,
        { postList: newData },
        "Lấy danh sách thành công!"
      );
    }
  } catch (error) {
    return handleErrorResponse(res, 401, error);
  }
};
module.exports.deleteProject = async (req, res) => {
  let { projectId } = req.body;
  let userId = await getCurrentId(req);
  if (projectId) {
    let project = await Project.findById(projectId);
    if (!project)
      return handleErrorResponse(res, 400, "Không tồn tại projectID");
    if(userId !== project.userId.toString()) {
      return handleErrorResponse(
        res,
        400,
        "Bạn không có quyền xóa Project"
      )
    }
    let query = await User.deleteProjectCreated(project.userId, projectId);
    if (!query) {
      return handleErrorResponse(res, 400, "Error deleteProjectCreated");
    }
    let listUserJoin = await project.get("userJoin");
    listUserJoin.map(async (value, i) => {
      let query = await User.outProject(value, projectId);
      if (!query) {
        return handleErrorResponse("Error outProject!");
      }
    });
    let listPost = await Post.find({projectId: projectId});
    listPost.map(async (value, i) => {
      await Comment.remove({postId: value._id});
      await Post.findOneAndRemove({_id: value._id});
    });
    await Task.remove({projectId: projectId});
    await Project.remove({_id: projectId});
    return handleSuccessResponse(res, 200, project, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại projectID");
  }
};
module.exports.getProject = async (req, res) => {
  // project created
  try {
    let userId = await getCurrentId(req);
    let userProject = await Project.find({ userId: userId });
    return handleSuccessResponse(res, 200, userProject, "Thành công");
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
    let project = await Project.findOne({ _id: projectId });
    return handleSuccessResponse(res, 200, project, "Thành công");
  } catch (error) {
    return handleErrorResponse(res, 400, "Không tồn tại project");
  }
};
module.exports.getProjectJoined = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let listProjectIdJoin = await (await User.findOne({ _id: userId })).get(
      "projectJoin"
    );
    let listProjectJoin = [];
    for (var i = 0; i < listProjectIdJoin.length; i++) {
      listProjectJoin.push(
        await Project.findOne({ _id: listProjectIdJoin[i] })
      );
    }
    return handleSuccessResponse(
      res,
      200,
      { projectJoined: listProjectJoin },
      "Thành công"
    );
  } catch (error) {
    return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu");
  }
};
module.exports.getChat = async (req, res) => {
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

module.exports.addChat = async (req, res) => {
  let body = req.body;
  let { projectId } = req.body;
  let project = await Project.findById(projectId);
  let user = await User.findById(body.userId);
  if (project && user) {
    project.chat.push({
      content: body.content,
      userId: body.userId,
      userName: user.username,
      avatar: user.avatar,
    });
    await project.save();
    return handleSuccessResponse(
      res,
      200,
      { listChat: project.chat },
      "Lấy comments thành công!"
    );
  } else return handleErrorResponse(res, 400, "Không tồn tại projectId");
};
module.exports.getUserJoin = async (req, res) => {
  let {projectId} = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if(project) {
    let listUser = project.userJoin;
    listUser.push(project.userId);
    let listProfile = [];
    for(let i=0; i<listUser.length; i++) {
      let user = await User.findById(listUser[i]);
      listProfile.push({
        userId: listUser[i],
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        admin: project.admin.indexOf(listUser[i]) != -1 ? "Admin" : "",
        userCreated: listUser[i] === project.userId ? "Created" : ""
      });
    }
    return handleSuccessResponse(
      res,
      200,
      {listUser: listProfile},
      "Thành công"
    )
  }
  return handleErrorResponse(
    res,
    400,
    "Thất bại"
  )
}
module.exports.setAdmin = async (req, res) => {
  let {projectId, memberId} = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if(project) {
    let listAdmin = [...project.admin];
    if(listAdmin.indexOf(userId) != -1) {
      if(listAdmin.indexOf(memberId) === -1) {
        listAdmin.push(memberId);
        let query = await Project.findOneAndUpdate(
          {_id: projectId},
          {admin: listAdmin},
          {new: true}
        );
        if(!query) return handleErrorResponse(res, 400, "Không thể thêm quyền Admin");
        let project = await Project.findById(projectId);
        let listUser = project.userJoin;
        listUser.push(project.userId);
        let listProfile = [];
        for(let i=0; i<listUser.length; i++) {
          let user = await User.findById(listUser[i]);
          listProfile.push({
          userId: listUser[i],
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          admin: project.admin.indexOf(listUser[i]) != -1 ? "Admin" : "",
          userCreated: listUser[i] === project.userId ? "Created" : ""
        });
        }
        return handleSuccessResponse(
          res,
          200,
          {listUser: listProfile},
          "Thành công"
        )
      }
      return handleErrorResponse(
        res, 400, "Member đã có quyền admin"
      )
    }
    return handleErrorResponse(
      res, 400, "Không có quyền Admin"
    )
  } 
  return handleErrorResponse(
    res,
    400,
    "Không tồn tại Project"
  )
}
module.exports.dropAdmin = async (req, res) => {
  let {projectId, memberId} = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if(project) {
    if(memberId === project.userId.toString()) return handleErrorResponse(res, 400, "Không thể xóa quyền Admin của người tạo Project");
    let listAdmin = [...project.admin];
    if(listAdmin.indexOf(userId) != -1) {
      if(listAdmin.indexOf(memberId) != -1) {
        listAdmin.splice(listAdmin.indexOf(memberId),1);
        let query = await Project.findOneAndUpdate(
          {_id: projectId},
          {admin: listAdmin},
          {new: true}
        );
        if(!query) return handleErrorResponse(res, 400, "Không thể xóa quyền Admin");
        let project = await Project.findById(projectId);
        let listUser = project.userJoin;
        listUser.push(project.userId);
        let listProfile = [];
        for(let i=0; i<listUser.length; i++) {
          let user = await User.findById(listUser[i]);
          listProfile.push({
          userId: listUser[i],
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          admin: project.admin.indexOf(listUser[i]) != -1 ? "Admin" : "",
          userCreated: listUser[i] === project.userId ? "Created" : ""
        });
        }
        return handleSuccessResponse(
          res,
          200,
          {listUser: listProfile},
          "Thành công"
        )
      }
      return handleErrorResponse(
        res, 400, "Member không có quyền admin"
      )
    }
    return handleErrorResponse(
      res, 400, "Không có quyền Admin"
    )
  } 
  return handleErrorResponse(
    res,
    400,
    "Không tồn tại Project"
  )
}
module.exports.deleteMember = async (req, res) => {
  let {projectId, memberId} = req.body;
  try {
    let userId = await getCurrentId(req);
    let project = await Project.findById(projectId);
    if(project) {
      if(memberId === project.userId.toString()) return handleErrorResponse(res, 400, "Không thể xóa người tạo ra khỏi Project");
      if(project.admin.indexOf(userId) != -1 || userId === memberId) {
        let query1 = await Project.userOut(memberId, projectId);
        let query2 = await User.outProject(memberId, projectId);
        // Delete task
        let taskCreated = await Task.find({projectId: projectId, authorId: memberId}); 
        taskCreated.map(async (value, i) => {
          await Task.findOneAndRemove({_id: value._id});
        });
        let taskJoin = await Task.find({projectId: projectId, assignment: memberId}); 
        taskJoin.map(async (value, i) => {
          let memberJoin = [...value.assignment];
          memberJoin.splice(memberJoin.indexOf(memberId),1);
          await Task.findByIdAndUpdate(
            {_id: value._id},
            {assignment: memberJoin},
            {new: true});
        });
        // delete post
        let postCreate = await Post.find({projectId: projectId, authorId: memberId});
        postCreate.map(async (value, i)=>{
          await Post.findByIdAndRemove(value._id);
          let comments = await Comment.find({postId: value._id});
          comments.map(async (value, i)=> {
            await Comment.findByIdAndRemove(value._id);
          });
        });
        // delete comment
        let comments = await Comment.find({authorId: memberId});
        comments.map(async (value, i)=> {
          await Comment.findByIdAndRemove(value._id);
        });
        let chats = project.chat;
        let listChats = [];
        chats.map((value, i) => {
          if(value.userId != memberId) {
            listChats.push(value);
          }
        });
        await Project.findOneAndUpdate(
          {_id: projectId},
          {chat: [...listChats]},
          {new: true}
        )
        if(query1 && query2) {
          let project = await Project.findById(projectId);
          let listUser = project.userJoin;
          listUser.push(project.userId);
          let listProfile = [];
          for(let i=0; i<listUser.length; i++) {
            let user = await User.findById(listUser[i]);
            listProfile.push({
              userId: listUser[i],
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              admin: project.admin.indexOf(listUser[i]) != -1 ? "Admin" : "",
              userCreated: listUser[i] === project.userId ? "Created" : ""
            });
          }
          return handleSuccessResponse(
            res,
            200,
            {listUser: listProfile},
            "Thành công"
          )
        }
        return handleErrorResponse(
          res, 400, "Không thành công"
        )
      }
      return handleErrorResponse(res, 400, "Không có quyền admin");
    }
  } catch (error) {
    return handleErrorResponse(
      res,
      400,
      error+""
    )
  }
}
