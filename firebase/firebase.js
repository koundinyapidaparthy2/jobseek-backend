const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "jobseekai-d2c07.firebasestorage.app",
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db };
