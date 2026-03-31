const express = require("express");
const { getBundle } = require("../controllers/bundleController");

const router = express.Router();

router.get("/:bundleId", getBundle);

module.exports = router;
