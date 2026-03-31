const express = require("express");
const multer = require("multer");
const {authMiddleware}= require("../middleware/authMiddleWare")
const {uploadMultipleFiles,getMyFiles,downloadFile,deleteFile,getPublicFile} = require("../controllers/fileController");


const { emailShareLink } = require("../controllers/fileController");


const router = express.Router();

const upload = multer({dest: "uploads/"});

router.get("/public/:id", getPublicFile);
router.get("/myfiles", authMiddleware, getMyFiles);
router.post("/download/:id", downloadFile);
// router.post("/upload", authMiddleware, upload.single("file"), uploadFile);


router.delete("/:id",authMiddleware,deleteFile)
router.post("/upload-multiple",
  authMiddleware,
  upload.array("files", 10),
  uploadMultipleFiles
);

router.post("/email", authMiddleware, emailShareLink);



module.exports = router;