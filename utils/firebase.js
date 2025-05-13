// utils/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json"); // get this from GCP console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
