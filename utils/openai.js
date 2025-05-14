const { OpenAI } = require("openai");
require("dotenv").config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callGPTForMatching(resume, job) {
  //   const prompt = `
  // You are an AI assistant. Given the following resume and job description, output a JSON in this format:
  // {
  //   "match_score": 0-100,
  //   "bullet_points": [
  //     {
  //       "jd_skill": "...",
  //       "resume_match": "...",
  //       "score": 0-1
  //     }
  //   ],
  //   "summary": "AI-generated paragraph about match"
  // }
  // Resume:
  // ${resume}

  // Job Description:
  // ${job}
  // `;

  //   const response = await openai.chat.completions.create({
  //     model: "gpt-4o",
  //     messages: [{ role: "user", content: prompt }],
  //     temperature: 0.3,
  //   });

  //   const text = response.choices[0].message.content;
  // return JSON.parse(text);
  return {};
}

module.exports = { callGPTForMatching };
