const express = require("express");
const router = express.Router();
const projectController = require("../app/controllers/projectController");
const authUser = require("../middleware/userMiddleware");

//router
router.use(authUser);
router.post("/addProject", projectController.addProject);
router.post("/deleteProject", projectController.deleteProject);
router.post("/getPosts", projectController.getPosts);
router.post("/addChat", projectController.addChat);
router.post("/getChat", projectController.getChat);
router.post("/getProject", projectController.getProject);
router.post("/getAllProject", projectController.getAllProject);
router.post("/joinProject", projectController.joinProject);
router.post("/getProjectById", projectController.getProjectById);
router.post("/getProjectJoined",projectController.getProjectJoined);
router.post("/getUserJoin", projectController.getUserJoin);
module.exports = router;
