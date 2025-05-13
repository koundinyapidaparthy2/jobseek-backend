// models/User.js
const { db } = require("../utils/firebase.js");

const USERS_COLLECTION = db.collection("users");

async function createUser({ email, password, name, googleId }) {
  const userRef = USERS_COLLECTION.doc(email);
  await userRef.set({ email, password, name, googleId, createdAt: new Date() });
  const snapshot = await userRef.get();
  return snapshot.data();
}

async function findUserByEmail(email) {
  const snapshot = await USERS_COLLECTION.doc(email).get();
  return snapshot.exists ? snapshot.data() : null;
}

module.exports = { createUser, findUserByEmail };
