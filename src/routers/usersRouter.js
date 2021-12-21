const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authUser = require("../middleware/userMiddleware");

//router
router.get("/", userController.getUser);
router.post("/login", userController.loginUser);
router.post("/signup", userController.signUp);
router.use(authUser);
router.get("/getUserId", userController.getCurrentUser);
router.delete("/deleteUserId", userController.deleteCurrentUser);
router.get("/logout", userController.logOut);
router.post("/update", userController.updateAccount);
router.put("/changePassword", userController.changePassword);
router.get("/getUserInfo", userController.getUserInfo);
router.get("/getUserName", userController.getUserName);
router.get("/getUserCurrent", userController.getUserCurrent);
module.exports = router;
