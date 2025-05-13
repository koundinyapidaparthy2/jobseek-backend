const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const htmlDocx = require("html-docx-js");

const resumeData = require("./data/resume.json");
const coverLetterData = require("./data/cover_letter.json");

const generateHtml = (templatePath, data) => {
  const template = fs.readFileSync(templatePath, "utf8");
  return mustache.render(template, data);
};

const generatePdf = async (htmlContent, outputPath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.pdf({ path: outputPath, format: "A4" });
  await browser.close();
};

const generateDocx = async (htmlContent, outputPath) => {
  const blob = htmlDocx.asBlob(htmlContent);
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
};

(async () => {
  const companySlug = coverLetterData.company.replace(/\s+/g, "_");
  const roleSlug = coverLetterData.role.replace(/\s+/g, "_");
  const folderName = `../${coverLetterData.company} - ${coverLetterData.role}`;

  const firstName = resumeData.name.split(" ")[0].toLowerCase();
  const lastName = resumeData.name.split(" ")[1].toLowerCase();

  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
  }

  // Resume
  const resumeHtmlPdf = generateHtml(
    "./templates/resume_pdf.mustache",
    resumeData
  );
  const resumeHtmlDoc = generateHtml(
    "./templates/resume_doc.mustache",
    resumeData
  );
  await generatePdf(
    resumeHtmlPdf,
    `${folderName}/${firstName}_${lastName}_resume.pdf`
  );
  await generateDocx(
    resumeHtmlDoc,
    `${folderName}/${firstName}_${lastName}_resume.docx`
  );

  // Cover Letter
  const coverHtml = generateHtml(
    "./templates/cover_letter.mustache",
    coverLetterData
  );
  await generatePdf(
    coverHtml,
    `${folderName}/${firstName}_${lastName}_cover_letter.pdf`
  );
  await generateDocx(
    coverHtml,
    `${folderName}/${firstName}_${lastName}_cover_letter.docx`
  );

  console.log(
    `Generated resume and cover letter for ${coverLetterData.company} - ${coverLetterData.role} in ${folderName}`
  );
})();
