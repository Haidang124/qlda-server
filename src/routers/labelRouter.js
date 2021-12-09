const express = require("express");
const router = express.Router();
const labelController = require("../controllers/labelController");
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
// router
router.use(authUser);
router.use(authProj);
router.get("/getLabel", labelController.getLabel);
router.post("/addLabel", labelController.addLabel);
router.post("/updateLabel", labelController.updateLabel);
router.post("/deleteLabel", labelController.deleteLabel);
module.exports = router;
