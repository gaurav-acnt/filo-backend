const express = require("express");
const {register,login, forgotPassword, resetPassword, changePassword, deleteAccount}= require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleWare");

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
router.post("/change-password",authMiddleware,changePassword);
router.delete("/delete-account",authMiddleware,deleteAccount)

module.exports= router;

