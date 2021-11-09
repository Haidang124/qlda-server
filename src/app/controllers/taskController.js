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
  function equalDate (date1, date2) {           // date1 > date2: 1; date1 === date2: 0; date1 < date2: -1
    let d1 = date1.getDate(), m1 = date1.getMonth(), y1 = date1.getFullYear();
    let d2 = date2.getDate(), m2 = date2.getMonth(), y2 = date2.getFullYear();
    if(y1 < y2) {
        return -1;
    } else if(y1 > y2) {
        return 1;
    } else {    //y1 === y2
        if(m1 < m2) {
            return -1;
        } else if(m1 > m2) {
            return 1;
        } else {
            if(d1 < d2) {
                return -1;
            } else if(d1 === d2) {
                return 0;
            } else {
                return 1;
            }
        }
    }
  }
  module.exports.addTask = async (req, res) => {
    let userId = await getCurrentId(req);
    let body = req.body;   //{projectId, name, desc, typeTask, assignment, deadline}
    body.authorId = userId;
    try {
        let user = await User.findById(userId);
        if(!user) {
            return handleErrorResponse(
                res,
                400,
                "Không tồn tại user"
            )
        }
        let task = new Task(body);
        task.save(async function(err, obj) {
            let listTask = await Task.find({projectId: body.projectId});
            if(err) {
                return handleErrorResponse(
                    res,
                    400,
                    "ErrorAddTask"
                );
            }
            return handleSuccessResponse(
                res,
                200,
                listTask,
                "AddTaskComplete"
            )
        });
    } catch (error) {
        return handleErrorResponse(
            res,
            400,
            "Error"
        )
    }
  }
  module.exports.getTask = async (req, res) => {
      let {projectId} = req.body;
      let listTask = await Task.find({projectId: projectId});
      return handleSuccessResponse(
          res,
          200,
          listTask,
          "Thành công"
      )
  }
  module.exports.updateTask = async (req, res) => {   //req: {id, projectId, assignment, typeTask, taskname, desc}
    let {id, projectId, assignment, typeTask, taskname, desc, deadline} = req.body;
    let task = await Task.findOneAndUpdate(
        {_id: id},
        {
        assignment: assignment,
        typeTask: typeTask,
        taskname: taskname,
        deadline: deadline,
        desc: desc
        },
        {new: true}
    );
    if(!task) {
        return handleErrorResponse(
            res,
            400,
            "Không tồn tại task"
        )
    }
    let listTask = await Task.find({projectId: projectId});
    return handleSuccessResponse(
        res,
        200,
        listTask,
        "UpdateCompleted"
    )
  }
  module.exports.deleteTask = async (req, res) => { //req: {id, projectId}
    let {id, projectId} = req.body;
    let query = await Task.findByIdAndRemove(id);
    if(!query) {
        return handleErrorResponse(
            res,
            400,
            "ErrorDelete"
        );
    }
    let listTask = await Task.find({projectId: projectId});
    return handleSuccessResponse(
        res,
        200,
        listTask,
        "UpdateCompleted"
    )
  }
  module.exports.analysis = async (req, res) => {
    let {projectId} = req.body;
    let project = await Project.findById(projectId);
    let listTask = await Task.find({projectId: projectId});
    if(!project) {
        return handleErrorResponse(
            res,
            400,
            "Không tồn tại projectId"
        );
    }
    let data = {
        dataUser: {},
        totalComplete: 0,
        totalPlenned: 0,
        totalInProgress: 0,
        totalTask: listTask.length,
        totalOverDeadline: 0
    };
    let listUser = project.userJoin;
    listUser.push(project.userId);
    for(let i=0; i<listUser.length; i++) {
      let user = await User.findById(listUser[i]);
      data.dataUser[user._id] = {
        userId: listUser[i],
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        taskCreated: [],
        taskPlanned: [],
        taskInProgress: [],
        taskComplete: [],
        taskOverDeadline: []
      };
    }
    listTask.map((value, index) => {
        switch(value.typeTask) {
            case "Planned": 
                data.totalPlenned++; 
                value.assignment.map((memberId, i) => {
                    data.dataUser[memberId]['taskPlanned'].push(value);
                });
                break;
            case "In Progress": 
                data.totalInProgress++; 
                value.assignment.map((memberId, i) => {
                    data.dataUser[memberId]['taskInProgress'].push(value);
                });
                break;
            case "Complete": 
                data.totalComplete++; 
                value.assignment.map((memberId, i) => {
                    data.dataUser[memberId]['taskComplete'].push(value);
                });
                break;
        }
        if(equalDate(value.deadline,new Date(Date.now())) === -1 && value.typeTask != "Complete") {
            data.totalOverDeadline++;
            value.assignment.map((memberId, i) => {
                data.dataUser[memberId]['taskOverDeadline'].push(value);
            });
        }  
    });
    return handleSuccessResponse(
        res,
        200,
        data,
        "Thành công"
    )
  }
  module.exports.getTaskUser = async (req, res) => {
      let {projectId, memberId} = req.body;
      let project = await Project.findById(projectId);
      let listTask = await Task.find({projectId: projectId});
      if(project && listTask) {
          let data = {
              userId: memberId,
              taskCreated: [], taskPlanned: [], taskInProgress: [], taskComplete: [], taskOverDeadline: [],
              totalPlenned: 0, totalInProgress: 0, totalComplete: 0, totalOverDeadline: 0, totalTask: listTask.length
          };
          if(project.userId != memberId && project.userJoin.indexOf(memberId) !== -1 ) {
              return handleErrorResponse(res, 400, "Không tồn tại member trong Project");
          }
          listTask.map((value, i) => {
              if(value.authorId === memberId) {
                  data.taskCreated.push(value);
              }
                switch(value.typeTask) {
                    case "Planned": 
                        data.totalPlenned++; 
                        if(value.assignment.indexOf(memberId) != -1) {
                            data.taskPlanned.push(value);
                        }
                        break;
                    case "In Progress": 
                        data.totalInProgress++; 
                        if(value.assignment.indexOf(memberId) != -1) {
                            data.taskInProgress.push(value);
                        }
                        break;
                    case "Complete": 
                        data.totalComplete++; 
                        if(value.assignment.indexOf(memberId) != -1) {
                            data.taskComplete.push(value);
                        }
                        break;
                }
                if(equalDate(value.deadline,new Date(Date.now())) === -1 && value.typeTask != "Complete") {
                    data.totalOverDeadline++;
                    if(value.assignment.indexOf(memberId) != -1) {
                        data.taskOverDeadline.push(value);
                    }
                }  
              
          });
          return handleSuccessResponse(
              res,
              200,
              data,
              "Thành công"
          )
      }
  }
  module.exports.getAllTaskUser = async (req, res) => {
    var userId = await getCurrentId(req);
    var data = {                
        arrDate: {},        // "date":[...arrTaskId]
        arrTaskId: {},      // "taskId":"date"
        listTask: {},       // "taskId": {id, taskname, projectId, authorId, deadline, assignment}
        statusDate: {}
    }
      try {
        var tasks = await Task.find({$or: [{authorId: userId}, {assignment: userId}]});
        for(var i=0; i<tasks.length; i++) {
            var project = await Project.findById(tasks[i].projectId);
            var stringDeadline = (new Date(tasks[i].deadline)).toDateString();
            if(typeof(data.arrDate[stringDeadline]) === "undefined") {
                data.arrDate[stringDeadline] = [];
                data.statusDate[stringDeadline] = {unfinished: 0, finished: 0};
            }
            data.arrDate[stringDeadline].push(tasks[i]._id);
            tasks[i].typeTask==="Complete"?data.statusDate[stringDeadline].finished++:data.statusDate[stringDeadline].unfinished++;
            data.arrTaskId[tasks[i]._id] = stringDeadline;
            data.listTask[tasks[i]._id] = {
                id: tasks[i]._id,
                typeTask: tasks[i].typeTask,
                taskname: tasks[i].taskname,
                projectId: tasks[i].projectId,
                projectName: project.name,
                authorId: tasks[i].authorId,
                deadline: tasks[i].deadline
            }
        }
        return handleSuccessResponse(res, 200, data, "Thành công");
      } catch (error) {
          return handleErrorResponse(
              res, 400, error
          )
      }
  }