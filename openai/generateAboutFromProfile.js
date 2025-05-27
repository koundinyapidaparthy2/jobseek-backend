const fs = require("fs");
const path = require("path");
const openai = require("./openai");

const systemPrompt = fs.readFileSync(
  path.resolve(__dirname, "../templates/Gpt/Profile/AboutYouPrompt.txt"),
  "utf-8"
);

const extractJsonFromCodeBlock = (raw) => {
  return raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
};

const generateAboutFromProfile = async (profile) => {
  // Flatten nested fields
  const bio = profile.bio || {};
  const name = bio.name || profile.name || "N/A";
  const location = bio.location || profile.location || "N/A";
  const skills =
    typeof profile.skills === "string"
      ? profile.skills
      : Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : "N/A";

  const experience = (profile.experience || [])
    .map((e) => `${e.title || e.role} at ${e.company}`)
    .join("; ");

  const projects = (profile.projects || [])
    .map((p) => p.title || p.name)
    .join(", ");

  const education = (profile.education || [])
    .map((e) => `${e.degree} at ${e.school}`)
    .join("; ");

  const formatted = `
Name: ${name}
Location: ${location}
Skills: ${skills}
Experience: ${experience || "N/A"}
Projects: ${projects || "N/A"}
Education: ${education || "N/A"}
`.trim();

  console.log("Formatted prompt to GPT:\n", formatted);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.6,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: formatted },
    ],
  });
  let raw = response.choices[0].message.content;
  console.log("raw", raw);
  raw = extractJsonFromCodeBlock(raw);

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse GPT output:", raw);
    throw new Error("Invalid JSON from GPT");
  }
};

module.exports = generateAboutFromProfile;
