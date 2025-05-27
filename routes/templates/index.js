const express = require("express");
const resumeTemplatesRoutes = require("./resumeTemplates");

const router = express.Router();

router.use("/resume", resumeTemplatesRoutes);

module.exports = router;
