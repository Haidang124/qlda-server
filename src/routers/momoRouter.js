const express = require("express");
const router = express.Router();
const momoController = require("../controllers/momoController");
const authUser = require("../middleware/userMiddleware");
//router
// router.use(authUser);
router.get("/payment", momoController.payment);
router.post("/checkPayment", momoController.checkPayment);

module.exports = router;
