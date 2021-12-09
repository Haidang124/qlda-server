const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
// router
router.use(authUser);
router.use(authProj);
router.get("/getSections", sectionController.getSections);
router.post("/addSection", sectionController.addSection);
router.post("/updateNameSection", sectionController.updateNameSection);
router.post("/deleteSection", sectionController.deleteSection);
module.exports = router;
