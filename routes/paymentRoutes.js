const express= require("express")

const {authMiddleware}= require("../middleware/authMiddleWare")
const {createOrder,verifyPayment, getMyPayments} = require("../controllers/paymentController")

const router = express.Router();

router.post("/order",authMiddleware,createOrder);
router.post("/verify",authMiddleware,verifyPayment);
router.get("/my",authMiddleware,getMyPayments);

module.exports = router;

