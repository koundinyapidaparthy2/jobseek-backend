const multer = require("multer");
const authenticateToken = require("../../middleware/auth");
const { getUserProfile } = require("../../models/profile");

const {
  generateMustacheTemplateFromHtml,
  generateHtmlFromPdfUsingVision,
} = require("../../openai");

const router = require("express").Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload-resume-html",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const file = req.file;
      const userId = req.user.id;

      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const html = await generateHtmlFromPdfUsingVision(
        file.buffer,
        file.originalname
      );
      const mustacheTemplate = await generateMustacheTemplateFromHtml(html);
      const profile = await getUserProfile(userId);

      return res.status(200).json({ mustacheTemplate, profile, html });
    } catch (err) {
      console.error("Upload Resume Vision Error:", err);
      return res
        .status(500)
        .json({ error: "Failed to generate resume layout" });
    }
  }
);

module.exports = router;
