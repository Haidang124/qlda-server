const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController.js");
const authUser = require("../middleware/userMiddleware");
//router
router.use(authUser);
router.get("/removeBlog", blogController.removeBlog);
router.post("/addBlog", blogController.addBlog);
router.post("/getBlog", blogController.getBlog);
router.post("/getBlogUser", blogController.getBlogUser);
router.post("/updateBlog", blogController.updateBlog);
module.exports = router;
