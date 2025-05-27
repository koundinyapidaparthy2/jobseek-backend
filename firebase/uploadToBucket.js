const admin = require("firebase-admin");

/**
 * Uploads a file buffer to a specified path in Firebase Storage and returns the public URL.
 *
 * @param {Object} options
 * @param {string} options.destinationPath - The path in the bucket (e.g., "autofillresume/userId/filename.pdf")
 * @param {Buffer} options.buffer - The file buffer to upload
 * @param {string} options.contentType - MIME type (e.g., "application/pdf")
 * @returns {Promise<string>} - Public URL to access the uploaded file
 */
const uploadToBucket = async ({ destinationPath, buffer, contentType }) => {
  const bucket = admin.storage().bucket();
  const file = bucket.file(destinationPath);

  await new Promise((resolve, reject) => {
    const stream = file.createWriteStream({
      metadata: { contentType },
    });

    stream.on("error", reject);
    stream.on("finish", resolve);

    stream.end(buffer);
  });

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491", // ~Forever
  });

  return url;
};

module.exports = uploadToBucket;
