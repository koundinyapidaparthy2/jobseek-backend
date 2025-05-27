const express = require("express");
const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const templatesRoutes = require("./templates");
const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/profile", profileRoutes);
router.use("/api/templates", templatesRoutes);

module.exports = router;
