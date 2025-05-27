const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts plain text from a PDF or DOCX buffer
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<string>}
 */
const extractTextFromFile = async (buffer, mimetype) => {
  if (mimetype === "application/pdf") {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type for parsing resume");
};

module.exports = extractTextFromFile;
