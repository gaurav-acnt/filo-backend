const express = require("express");

const {sendOtp, verifyOtpAndRegister}= require("../controllers/otpController");

const router = express.Router();

router.post("/send",sendOtp);
router.post("/verify-register",verifyOtpAndRegister)


module.exports= router;