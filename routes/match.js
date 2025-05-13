const express = require("express");
const multer = require("multer");
const { callGPTForMatching } = require("../utils/openai");
const router = express.Router();

const upload = multer({ dest: "upload/" });

router.post(
  "/match",
  upload.fields([{ name: "resume" }, { name: "job" }]),
  async (req, res) => {
    try {
      const resumeText = req.files["resume"][0].buffer.toString();
      const jobText = req.files["job"][0].buffer.toString();

      const jsonOutput = await callGPTForMatching(resumeText, jobText);
      res.json({ success: true, data: jsonOutput });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Matching failed" });
    }
  }
);

module.exports = router;
