const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
//router
router.get("/getTaskGithub", taskController.getTaskGithub);
router.use(authUser);
// router.post("/getAllTaskUser", taskController.getAllTaskUser);
router.use(authProj);
router.post("/addTask", taskController.addTask);
router.get("/getTask", taskController.getTask);
router.get("/getTasks", taskController.getTasks);
router.post("/addAssignment", taskController.addAssignment);
router.post("/deleteAssignment", taskController.deleteAssignment);
router.post("/changeSection", taskController.changeSection);
router.post("/updateTask", taskController.updateTask);
router.post("/deleteTask", taskController.deleteTask);
// router.post("/analysis", taskController.analysis);
// router.post("/getTaskUser", taskController.getTaskUser);
module.exports = router;
