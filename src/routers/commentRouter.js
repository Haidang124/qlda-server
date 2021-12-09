const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authUser = require("../middleware/userMiddleware");

//router
router.use(authUser);
router.post("/addComment", commentController.addComment);
router.post("/deleteComment", commentController.deleteComment);
router.post("/updateComment", commentController.updateComment);

module.exports = router;
