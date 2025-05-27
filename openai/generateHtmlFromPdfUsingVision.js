const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const openai = require("./openai"); // assumes OpenAI SDK v4 configured

const systemPrompt = fs.readFileSync(
  path.resolve(
    __dirname,
    "../templates/Gpt/Templates/PdfToHtmlGeneratePrompt.txt"
  ),
  "utf-8"
);

const extractHtmlFromCodeBlock = (raw) =>
  raw
    .replace(/^```(?:html)?/i, "")
    .replace(/```$/, "")
    .trim();

const generateHtmlFromPdfUsingAssistants = async (
  pdfBuffer,
  filename = "resume.pdf"
) => {
  const tempFile = tmp.fileSync({ postfix: ".pdf" });
  fs.writeFileSync(tempFile.name, pdfBuffer); // write buffer to file

  const uploadedFile = await openai.files.create({
    file: fs.createReadStream(tempFile.name),
    purpose: "assistants",
  });

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Extract the HTML layout of this resume.",
    attachments: [
      {
        file_id: uploadedFile.id,
        tools: [{ type: "file_search" }],
      },
    ],
  });

  const assistant = await openai.beta.assistants.create({
    name: "Resume HTML Generator",
    instructions: systemPrompt,
    model: "gpt-4-turbo",
    tools: [{ type: "file_search" }], // ✅ add this
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  let runStatus;
  do {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  } while (runStatus.status !== "completed");

  const messages = await openai.beta.threads.messages.list(thread.id);
  const raw = messages.data[0].content[0].text.value;

  tempFile.removeCallback(); // clean up temp file

  return extractHtmlFromCodeBlock(raw);
};

module.exports = generateHtmlFromPdfUsingAssistants;
