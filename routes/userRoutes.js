const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleWare");
const { getMyProfile ,searchUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/me",authMiddleware,getMyProfile);
router.get("/search", authMiddleware, searchUsers);


module.exports = router;