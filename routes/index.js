const express = require("express");
const authRoutes = require("./auth");
const matchRoutes = require("./match");

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/match", matchRoutes);

module.exports = router;
