const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController.js");
const authUser = require("../middleware/userMiddleware");
//router
router.use(authUser);
router.post("/addChat", chatController.addChat);
router.post("/getChat", chatController.getChat);
router.post("/removeChat", chatController.removeChat);
router.get("/getListChat", chatController.getListChat);
module.exports = router;
