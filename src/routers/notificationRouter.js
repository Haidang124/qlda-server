const express = require("express");
const projectMiddleware = require("../middleware/projectMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const router = express.Router();
const notificatioController = require("../controllers/notificationController");

router.use(userMiddleware);
router.get("/getNotifications", notificatioController.getNotifications);
router.post('/deleteNotification', notificatioController.deleteNotification)
router.use(projectMiddleware);
router.post("/sendNotifications", notificatioController.sendNotifications);

module.exports = router;
