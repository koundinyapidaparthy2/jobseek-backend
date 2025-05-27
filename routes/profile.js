const express = require("express");
const multer = require("multer");
const authenticateToken = require("../middleware/auth");
const uploadToBucket = require("../firebase/uploadToBucket");
const extractTextFromFile = require("../utils/files/extractTextFromFile");
const { parseResumeFromText, generateAboutFromProfile } = require("../openai");
const { setResumeStatus, getResumeStatus } = require("../models/resumeStatus");
const {
  createOrUpdateUserProfile,
  getUserProfile,
} = require("../models/profile");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Save or update profile

router.post("/generate-about", authenticateToken, async (req, res) => {
  try {
    const { profile } = req.body;
    const summaries = await generateAboutFromProfile(profile);
    res.json({ summaries });
  } catch (err) {
    console.error("Generate About Error:", err);
    res.status(500).json({ error: "Failed to generate about summaries" });
  }
});

router.put("/update", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    await createOrUpdateUserProfile(userId, data);

    const profile = await getUserProfile(userId); // Fetch after saving
    res.status(200).json({ message: "Profile updated", profile });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get current user's profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/upload-autofill-resume",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    const file = req.file;
    const userId = req.user.id;

    if (!file) return res.status(400).json({ error: "No file provided" });

    const processId = uuidv4();

    await setResumeStatus(userId, {
      status: "processing",
      processId,
      profile: null,
      error: null,
    });

    const fileExtension = file.originalname.split(".").pop();
    const filename = `autofillresume/${userId}/resume.${fileExtension}`;

    (async () => {
      try {
        const fileUrl = await uploadToBucket({
          destinationPath: filename,
          buffer: file.buffer,
          contentType: file.mimetype,
        });

        const text = await extractTextFromFile(file.buffer, file.mimetype);
        const profileData = await parseResumeFromText(text);
        profileData.resumeUrl = fileUrl;

        await setResumeStatus(userId, {
          status: "completed",
          processId,
          profile: profileData,
          error: null,
        });
      } catch (err) {
        await setResumeStatus(userId, {
          status: "failed",
          processId,
          profile: null,
          error: err.message,
        });
      }
    })();

    res.status(202).json({ processId });
  }
);

router.get(
  "/upload-autofill-resume/status",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await getResumeStatus(userId);

      if (!status)
        return res.status(404).json({ error: "No resume status found." });

      res.status(200).json(status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post("/download-resume", authenticateToken, async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    const base64 = Buffer.from(response.data).toString("base64");
    const contentType = response.headers["content-type"];

    res.status(200).json({
      base64,
      mimeType: contentType,
    });
  } catch (error) {
    console.error("Download resume error:", error.message);
    res.status(500).json({ error: "Failed to fetch resume file" });
  }
});

module.exports = router;
