const express = require("express");
const bcrypt = require("bcryptjs");
const { createUser, findUserByEmail } = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token");

const { createOrUpdateUserProfile } = require("../models/profile");

const router = express.Router();

function generateTokens(user) {
  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
}

// Signup
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const exists = await findUserByEmail(email);
    if (exists) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ email, password: hashed, name });
    await createOrUpdateUserProfile(user.id, { name });

    const tokens = generateTokens(user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user || !user.password)
      return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const tokens = generateTokens(user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Signup/Login
router.post("/google", async (req, res) => {
  const { email, name, googleId } = req.body;
  try {
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser({ email, name, googleId });
      await createOrUpdateUserProfile(user.id, { name });
    }
    const tokens = generateTokens(user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh token
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);
  try {
    const user = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({ email: user.email });
    res.json({ accessToken });
  } catch (err) {
    res.sendStatus(403);
  }
});

module.exports = router;
