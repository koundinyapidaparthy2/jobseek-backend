const openai = require("./openai");
const fs = require("fs");
const path = require("path");

const systemPrompt = fs.readFileSync(
  path.resolve(
    __dirname,
    "../templates/Gpt/Templates/HtmlToMustacheGeneratePrompt.txt"
  ),
  "utf-8"
);

/**
 * Clean GPT output by removing markdown fences (```html ... ```)
 */
const extractHtmlFromCodeBlock = (raw) => {
  return raw
    .replace(/^```(?:html|mustache)?/i, "")
    .replace(/```$/, "")
    .trim();
};

const generateMustacheTemplateFromHtml = async (html) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // or "gpt-4o-mini"
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: html },
    ],
  });

  const raw = response.choices[0].message.content;
  return extractHtmlFromCodeBlock(raw);
};

module.exports = generateMustacheTemplateFromHtml;
