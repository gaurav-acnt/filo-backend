const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleWare");
const { getOrCreateRoom, getMessages, getMyRooms } = require("../controllers/chatController");


const router = express.Router();

router.post("/room", authMiddleware, getOrCreateRoom);
router.get("/rooms", authMiddleware, getMyRooms);
router.get("/messages/:roomId", authMiddleware, getMessages);

module.exports = router;
