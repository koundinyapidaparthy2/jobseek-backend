const fs = require("fs");
const path = require("path");
const openai = require("./openai");

const parseResumeToText = fs.readFileSync(
  path.resolve(__dirname, "../templates/Gpt/Profile/parseResumeToText.txt"),
  "utf-8"
);

/**
 * Cleans GPT response by stripping code block wrappers like ```json ... ```
 */
const extractJsonFromCodeBlock = (raw) => {
  return raw
    .replace(/^```(?:json)?/i, "") // remove starting ``` or ```json
    .replace(/```$/, "") // remove trailing ```
    .trim();
};

const parseResumeFromText = async (plainText) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      { role: "system", content: parseResumeToText },
      { role: "user", content: plainText },
    ],
  });

  console.log("raw", response);
  let raw = response.choices[0].message.content;
  console.log("raw", raw);
  raw = extractJsonFromCodeBlock(raw);

  return JSON.parse(raw); // ✅ Safe parse
};

module.exports = parseResumeFromText;
