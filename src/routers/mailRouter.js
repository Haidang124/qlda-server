const express = require("express");
const router = express.Router();
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
const mailer = require("../services/mailer");
//router
router.use(authUser);
router.post("/confirmEmail", mailer.checkConfirmEmail);
router.use(authProj);
router.post("/sendEmail", mailer.sendEmail);
module.exports = router;
